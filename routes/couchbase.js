'use strict';

var config = require('config');
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var app = express();
app.use(bodyParser.urlencoded({
    extended: true
}));
var seed = 'seed' + config.app.clusterid; // set our key domain partition
var couchbase = require("couchbase");
var bases = require('bases');
var currentUrl = '0'; // global var, my incrementing key/url


/**
 *    Get our couchbase connection
 **/
var cluster = new couchbase.Cluster(config.couchbase.host);
var bucket = cluster.openBucket(config.couchbase.bucket, function(err) {
    if (err) {
        console.log(err);
    } else {
        bucket.operationTimeout = 60 * 1000;
        console.log('Connected to Couchbase bucket: ' + config.couchbase.bucket);
    }
});


/**
 *      Format user's incoming url so it redirects properly
 **/
var formatUrl = function(url) {
    if ((url === undefined) || (url === null)) {
        return '';
    }

    // already has http or https?  we're done
    if (url.toLowerCase().indexOf('http') > -1) {
        return url;
    }

    // remove leading slashes
    while (url.charAt(0) === '/') {
        url = url.substring(1, url.length);
    }

    // assume standard http
    return 'http://' + url;
}


/**
 *     Accept user's inpput of url and custom url
 **/
app.post('/input', function(req, res) {
    var url = req.body.url;
    var customUrl = req.body.customUrl;
    var html = '';

    urlWrite(customUrl, url, function(err, value) {
        if (err) {
            html = 'Failed: err message is ' + err + '.<br>';
        } else {
            html = 'Success:' + value + '.<br>';
        }

        res.send(html)
    });
});


/**
 *    Keep seed and configuration stuff in a different bucket to avoid naming conflicts
 **/
var seedBucket = cluster.openBucket(config.seedbase.bucket, function(err) {
    if (err) {
        console.log(err);
    } else {
        seedBucket.operationTimeout = 60 * 1000;
        console.log('Connected to Couchbase bucket: ' + config.seedbase.bucket);
    }
});


/** 
 *  increment base-36 value for new url
 **/
var keyIncrementer = function(callback) {
    var nextUrl = bases.fromBase32(currentUrl);
    nextUrl = parseFloat(nextUrl) + 1;
    currentUrl = bases.toBase32(nextUrl + '');
    callback(config.app.clusterid + currentUrl);

    // save latest generated key in case server crashes
    // okay if this is an async process, it's not used in the app
    seedWrite(currentUrl, function() {
        console.log('saving currenturl value: ' + currentUrl);
    });
}


/**
 *  REST call to read current seed key
 **/
app.get('/seed', function(req, res, next) {
    seedRead(function(err, val) {
        if (err) {
            res.send(err);
        } else {
            res.send(val);
        }
    })
});


/**
 *   Get our current 36-base key value
 **/
var seedRead = function(callback) {

    seedBucket.get(seed, function(err, result) {

        if (err) {
            // first seed call?  Create it then if allowed
            if (config.app.seed) {
                seedWrite('0', function() {
                    console.log('inserted first seed');
                });
            } else {
                console.log('no seed available!!');
            }
            return callback(err);
        } else {
            return callback(null, result.value.currentUrl);
        }
    });
};


/**
 *   Write our current 36-base key value
 **/
var seedWrite = function(value, callback) {

    var jsonData = {};
    jsonData['currentUrl'] = value;

    seedBucket.upsert(seed, jsonData, {
        "expiry": config.couchbase.ttl
    }, function(err, result) {

        // return error
        if (err) {
            return callback(err, null);

            // else return success
        } else {
            return callback(null);
        }
    });
}


/**
 *  REST call to read a entry from couchbase
 **/
app.get('/read', function(req, res, next) {
    urlRead(req.query.key, function(err, val) {
        if (err) {
            res.send(err);
        } else {
            res.send(val);
        }
    })
});


/**
 *    Read an entry from couchbase
 **/
var urlRead = function(key, callback) {

    if (key === null) {
        return callback(null, 'Error: No key value specified');
    }

    bucket.get(key, function(err, result) {
        if (err) {
            return callback(err);
        } else {
            return callback(null, result);
        }
    });
};


/**
 *  REST call to write entry to couchbase
 **/
app.get('/write', function(req, res, next) {
    urlWrite(req.query.key, req.query.url, function(err, val) {
        if (err) {
            res.send(err);
        } else {
            res.send(val);
        }
    })
});


/**
 *   Write key, value to couchbase
 **/
var urlWrite = function(key, url, callback) {

    var myKey = key;

    if ((url === undefined) || (url === null)) {
        return callback('Error: No url specified');
    }

    // no key, generate the next url here
    if (myKey) {} else {
        keyIncrementer(function(result) {
            myKey = result
        }); // save our incremented key in global variable
    }

    // don't allow duplicate entries
    urlRead(myKey, function(err, result) {

        if ((result !== undefined) && (result !== null)) {
            return callback('The url "' + myKey + '" already exists: ' + JSON.stringify(result));
        }

        var jsonData = {};
        jsonData['url'] = formatUrl(url);

        bucket.upsert(myKey, jsonData, {
            "expiry": config.couchbase.ttl
        }, function(err, result) {

            // return error
            if (err) {
                return callback(err, null);

                // else return success
            } else {
                return callback(null, 'your reduced url is ' + '/url/' + myKey);
            }
        });
    });
}


/**
 *    Do my redirection
 **/
app.get('/url/*', function(req, res, next) {

    var myKey = req.url.substring(5, req.url.length);

    // get redirect url for our reduced url
    urlRead(myKey, function(err, record) {
        if (err) {
            console.log('err=' + err);
            res.send(err);
        } else {
            console.log('redircting to ' + record.value.url);
            res.redirect(record.value.url);
        }
    })
});


/**
 *    Find set of original urls
 **/
app.get('/findKeys', function(req, res, next) {

    findKeys(req.query.url, function(err, val) {
        if (err) {
            res.send(err);
        } else {
            res.json(val);
        }
    })
});


/** 
 *     Find the records which redirect to a selected url
 **/
var findKeys = function(url, callback) {

    var matches = [];
    var ViewQuery = couchbase.ViewQuery;
    var query = ViewQuery.from('dev_nintex', 'findkeys');
    bucket.query(query, function(err, results) {
        if (err) {
            return callback(err);
        }
        for (var i in results)
            if (results[i].key.indexOf(url) > -1) {
                matches.push(results[i]);
            }

        return callback(null, matches);
    });
}


/**
 *  REST call to read a entry from couchbase
 **/
app.get('/configuration', function(req, res, next) {
    res.send(configuration());
});


/**
* system configuration info
**/
var configuration = function() {
    var process = require('process');

    var result = "Configuration:<br>";

    result = result + "config environment = " + config.environment + "<br>";
    result = result + "NODE_ENV = " + process.env.NODE_ENV;
    result = result + "<br>app:<br><br>";

    for (var key in config.app) {
        result = result + key + " = " + config.app[key] + "<br>";
    }
    result = result + "<br>couchbase:<br><br>";
    for (var key in config.couchbase) {
        result = result + key + " = " + config.couchbase[key] + "<br>";
    }
    result = result + "<br>seedbase:<br><br>";
    for (var key in config.seedbase) {
        result = result + key + " = " + config.seedbase[key] + "<br>";
    }

    return result;
}


/**
 *     on startup, retrieve the current generated ksy,
 *     then keep it in memory and increment it
 **/
seedRead(function(err, value) {
    if (err) {
        console.log(err);
    } else {
        currentUrl = value;
        console.log("current url is " + value);
    }
});


module.exports = app;
module.exports.methods = {
    couchbase: couchbase,
    urlRead: urlRead,
    urlWrite: urlWrite,
    formatUrl: formatUrl,
    seedRead: seedRead,
    seedWrite: seedWrite,
    findKeys: findKeys,
    keyIncrementer: keyIncrementer,
    configuration: configuration
};
