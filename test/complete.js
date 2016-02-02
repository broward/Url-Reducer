var should = require('chai').should();
var expect = require('chai').expect;
var assert = require('assert');
var p = require('../package.json');
var cb = require('../routes/couchbase.js');
var supertest = require('supertest');

var config = require('config');

function makeUrl() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 10; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return 'TEST' + text;
}

describe("NUR Test Suite", function() {

    // set higher timeout to give SQL server connection time to complete

    var randomUrl = makeUrl();

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
            // should add http://
            var test = '';
            cb.methods.formatUrl(test);
            assert(true, test === 'http://');

            // should do nothing
            test = 'https://www.bing.com';
            cb.methods.formatUrl(test);
            assert(true, test === 'https://www.bing.com');

            // should do case-insensitive
            test = 'HTTP://www.bing.com';
            cb.methods.formatUrl(test);
            assert(true, test === 'HTTP://www.bing.com');

            done();
        });

        it("test custom url write method", function(done) {

            // custom url should work
            cb.methods.urlWrite(randomUrl, 'www.bing.com', function(err, message) {
                assert(true, err === null);
                should.exist(message);
                console.log(message);
                assert(true, message.indexOf('reduced url') > -1);
                done();
            });
        });

        // duplicate key should get an error
        it("test duplicate custom write method", function(done) {
            cb.methods.urlWrite(randomUrl, 'www.bing.com', function(err1, message) {
                assert(true, message === null);
                should.exist(err1);
                assert(true, err1.indexOf('already exists') > -1);
                done();
            });
        });

        it("test generated url write method", function(done) {
            // generated key should work
            cb.methods.urlWrite('', 'www.bing.com', function(err, message) {
                console.log('err=' + err);
                console.log('message=' + message);
                assert(true, err === null);
                should.exist(message);
                assert(true, message.indexOf('reduced url') > -1);
                done();
            });
        });

        it("test read method", function(done) {
            cb.methods.urlRead(randomUrl, function(err, value) {
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
            cb.methods.findKeys('www.bing.com', function(err, result) {
                assert(true, err === null);
                should.exist(result);
                console.log("result size = " + result.length);
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
                .post('/input')
                .expect(200, done);
        });

        it("Test Seed API", function(done) {
            supertest(cb)
                .get('/seed')
                .expect(200, done);
        });

        it("Test Read API", function(done) {
            supertest(cb)
                .get('/read?key=' + randomUrl)
                .expect(200, done);
        });

        it("Test Write API", function(done) {
            supertest(cb)
                .get('/write?url=' + randomUrl)
                .expect(200, done);
        });

        it("Test FindKeys API", function(done) {
            supertest(cb)
                .get('/findKeys?url=bing')
                .expect(200, done);
        });

        it("Test Url Redirect API", function(done) {
            supertest(cb)
                .get('/url/' + randomUrl)
                .expect(302, done);
        });
    });

});
