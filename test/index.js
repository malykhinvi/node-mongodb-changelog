const assert = require('assert');
const should = require('should');
const MongoClient = require('mongodb').MongoClient;
const co = require('co');

const CONFIG = {mongoUrl: 'mongodb://localhost/dbchangelog_test'};

const changelog = require('../src/index');
const HashError = require('../src/error').HashError;
const IllegalTaskFormat = require('../src/error').IllegalTaskFormat;


before(function(done) {
    co(function* () {
        const db = yield MongoClient.connect(CONFIG.mongoUrl);
        yield db.collection('databasechangelog').deleteMany({});
    }).then(done);
});

describe('changelog(config, tasks)', function() {
    it('should apply unprocessed operations', function(done) {
        changelog(CONFIG, [
            {name: 'first', operation: () => Promise.resolve(true)},
            {name: 'second', operation: () => Promise.resolve(true)}
        ]).then(function(result) {
            result.should.be.equal('OK');
            done();
        });
    });

    it('should not apply already processed operations', function(done) {
        changelog(CONFIG, [
            {name: 'first', operation: () => Promise.resolve(true)},
            {name: 'second', operation: () => Promise.resolve(true)}
        ]).then(function(result) {
            result.should.be.equal('OK');
            done();
        });
    });

    it('should reject with HashError if already applied operation hash changed', function(done) {
        const changedOperation = () => {
            console.log('this is a change');
            return Promise.resolve(true);
        };
        changelog(CONFIG, [
            {name: 'first', operation: changedOperation}
        ]).catch((err) => {
            err.should.be.an.instanceOf(HashError);
            done();
        });
    });

    it('should reject with IllegalTaskFormat if some operation does not fit format', function(done) {
        changelog(CONFIG, [
            {wrongname: 'first'}
        ]).catch((err) => {
            err.should.be.an.instanceOf(IllegalTaskFormat);
            done();
        });
    });

});


