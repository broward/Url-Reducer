var should = require('chai').should();
var expect = require('chai').expect;
var assert = require('assert');
var p = require('../package.json');
var cb = require('../routes/couchbase.js');
var supertest = require('supertest');
var config = require('config');

// generate a random reduce url
function makeUrl() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 10; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return 'TEST' + text;
}

describe("NUR Test Suite", function() {

    // set higher timeout to give SQL server connection time to complete

    var reduceUrl = makeUrl();
    var redirectUrl = 'www.bing.com';

    // iniialize command line arguments
    before(function(done) {
        var mockcb = require('couchbase').Mock;
        // var db = new couchbase.Connection();
        cb.methods.couchbase = mockcb;
        done();
    });

    // Test for existence of the project and important variables
    describe("Existence Suite", function() {
        it("test if program and package exists", function(done) {
            should.exist(p);
            should.exist(cb);
            done();
        });
    });

    // Test couchbase functions
    describe("Couchbase Suite", function() {

        it("test formatUrl method", function(done) {

            // should fail
            var test = null;
            cb.methods.formatUrl(test);
            console.log(test);
            assert(true, test === 'http://');

            // should add http://
            test = '';
            cb.methods.formatUrl(test);
            assert(true, test === 'http://');

            // should do nothing
            test = 'https://' + redirectUrl;
            cb.methods.formatUrl(test);
            assert(true, test === 'https://' + redirectUrl);

            // should do case-insensitive
            test = 'HTTP://' + redirectUrl;
            cb.methods.formatUrl(test);
            assert(true, test === 'HTTP://' + redirectUrl);

            done();
        });

        it("test custom url write method", function(done) {

            // custom url should work
            cb.methods.urlWrite(reduceUrl, redirectUrl, function(err, message) {
                assert(true, err === null);
                should.exist(message);
                assert(true, message.indexOf('reduced url') > -1);
                done();
            });
        });

        // re-using reduce key should get an error
        it("test duplicate custom write method", function(done) {
            cb.methods.urlWrite(reduceUrl, redirectUrl, function(err1, message) {
                assert(true, message === null);
                should.exist(err1);
                assert(true, err1.indexOf('already exists') > -1);
                done();
            });
        });

        it("test generated url write method", function(done) {
            // generated key should always work
            cb.methods.urlWrite('', redirectUrl, function(err, message) {
                assert(true, err === null);
                should.exist(message);
                assert(true, message.indexOf('reduced url') > -1);
                done();
            });
        });

        it("test read method", function(done) {
            cb.methods.urlRead(reduceUrl, function(err, value) {
                assert(true, err === null);
                should.exist(value);
                assert(true, value.toString().indexOf('reduced url') > -1);
                done();
            });
        });

        it("test keyIncrementer", function(done) {
            cb.methods.keyIncrementer(function(key) {
                // should return a key
                should.exist(key);
                // clusterid should be first char
                assert(true, key.charAt(0) === config.app.clusterId);
                done();
            });
        });

        it("test findKeys", function(done) {
            cb.methods.findKeys(redirectUrl, function(err, result) {
                assert(true, err === null);
                should.exist(result);
                assert(true, result.length > 0);
                done();
            });
        });

        it("test configuration", function(done) {
            var info = cb.methods.configuration();
            should.exist(info);
            assert(true, info.indexOf('NODE_ENV') > -1);
            done();
        });
    });

    // Test REST API now that we have test data
    describe("REST API Suite", function() {

        it("Test Input Form", function(done) {
            supertest(cb)
                .post(config.rest.input)
                .expect(200, done);
        });

        it("Test Seed API", function(done) {
            supertest(cb)
                .get(config.rest.seed)
                .expect(200, done);
        });

        it("Test Read API", function(done) {
        	var params = { "key" : reduceUrl};
            supertest(cb)
                .get(config.rest.reduce.substring(0, 8) + params)
                .expect(200, done);
        }); 

        it("Test Write API", function(done) {
        	var params = { "key" : reduceUrl, "url" : redirectUrl};
            supertest(cb)
                .post(config.rest.reduce.substring(0, 8) + params)
                .expect(200, done);
        });

        it("Test FindKeys API", function(done) {
            supertest(cb)
                .get(config.rest.findKeys.substring(0, 10) + redirectUrl)
                .expect(200, done);
        });

        it("Test config", function(done) {
            supertest(cb)
                .get(config.rest.config)
                .expect(200, done);
        });

        it("Test Url Redirect API", function(done) {
            supertest(cb)
                .get(config.rest.url.substring(0, 5) + reduceUrl)
                .expect(302, done);
        });
    });

    // remove test records
    after(function(done) {
        var N1qlQuery = require('couchbase').N1qlQuery;
        var query = N1qlQuery.fromString("DELETE FROM `default` where meta().id like 'TEST%' ;");
        cb.methods.bucket.query(query, function(err, matches) {
            done();
        });
    });

});
