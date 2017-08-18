'use strict';

const should = require('should');
const MongoClient = require('mongodb').MongoClient;

const CONFIG = {mongoUrl: 'mongodb://localhost/dbchangelog_test'};

const changelog = require('../src/index');
const HashError = require('../src/error').HashError;
const IllegalTaskFormat = require('../src/error').IllegalTaskFormat;

let db;

const firstOperation = () => {
    const collection = db.collection('users');
    return collection.insert({username: 'admin', password: 'test', isAdmin: true});
};
const secondOperation = () => Promise.resolve(true);
const thirdOperation = () => Promise.reject();

before(async function() {
    db = await MongoClient.connect(CONFIG.mongoUrl);
    await db.collection('databasechangelog').deleteMany({});
    await db.collection('users').deleteMany({});
});

describe('changelog(config, tasks)', function() {
    it('should return Promise', () => {
        changelog(CONFIG, []).should.be.an.instanceOf(Promise);
    });

    it('should apply unprocessed operations', function(done) {
        changelog(CONFIG, [
            {name: 'first', operation: firstOperation},
            {name: 'second', operation: secondOperation}
        ]).then(function(result) {
            result.should.have.property('first', changelog.Statuses.SUCCESSFULLY_APPLIED);
            result.should.have.property('second', changelog.Statuses.SUCCESSFULLY_APPLIED);
            db.collection('users').findOne({username: 'admin'}).then(user => {
                user.should.have.property('username', 'admin');
                user.should.have.property('password', 'test');
                user.should.have.property('isAdmin', true);
                done();
            });
        });
    });

    it('should not apply already processed operations', function(done) {
        changelog(CONFIG, [
            {name: 'first', operation: firstOperation},
            {name: 'second', operation: secondOperation}
        ]).then(function(result) {
            result.should.have.property('first', changelog.Statuses.ALREADY_APPLIED);
            result.should.have.property('second', changelog.Statuses.ALREADY_APPLIED);
            done();
        });
    });

    it('should reject with HashError if already applied operation hash changed', function(done) {
        changelog(CONFIG, [
            {name: 'second', operation: thirdOperation}
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

    it('should work as async function', async function() {
        const appliedTasks = await changelog(CONFIG, [
            {name: 'asyncExample', operation: firstOperation}
        ]);
        appliedTasks.should.match({asyncExample: 'SUCCESSFULLY_APPLIED'});
    });

    it('should work as async function (error)', async function() {
        try{
            await changelog(CONFIG, [{wrongname: 'first'}]);
        } catch (error) {
            error.should.be.an.instanceOf(IllegalTaskFormat);
        }
    });

});


