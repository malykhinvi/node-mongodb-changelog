var assert = require('assert'),
    should = require('should'),
    MongoClient = require('mongodb').MongoClient;

var dbUrl = 'mongodb://localhost/dbchangelog_test';

var changelog = require('../index.js')({url : dbUrl}),
    HashError = require('../errors').HashError,
    IllegalTaskFormat = require('../errors').IllegalTaskFormat;


before(function(done){
    MongoClient.connect(dbUrl, function(err, db) {
        db.dropDatabase(done);
    });
});

describe('Changelog', function() {
    describe('#run(tasks, callback)', function() {
        it('should apply two changesets', function(done) {
            changelog.run([
                { name: 'first', changeset: function(cb) { console.log(1); cb(); } },
                { name: 'second', changeset: function(cb) { console.log(2); cb(); } }
            ], function(err, executed) {
                executed.should.have.a.lengthOf(2);
                done(err);
            });
        });

        it('should not apply already applied changesets', function(done) {
            changelog.run([
                { name: 'first', changeset: function(cb) { console.log(1); cb(); } },
                { name: 'second', changeset: function(cb) { console.log(2); cb(); } }
            ], function(err, executed) {
                executed.should.have.a.lengthOf(0);
                done(err);
            });
        });

        it('should throw HashError if already applied changeset hash changed', function(done) {
            changelog.run([
                { name: 'first', changeset: function(cb) { console.log('this value changes changeset hash'); cb(); } }
            ], function(err) {
                err.should.be.an.instanceOf(HashError);
                done();
            });
        });

        it('should throw IllegalTaskFormat if some task does not fit format', function(done) {
            changelog.run([
                { wrongname: 'first', changeset: function(cb) { console.log('this value changes changeset hash'); cb(); } }
            ], function(err) {
                err.should.be.an.instanceOf(IllegalTaskFormat);
                done();
            });
        });

        it('should accept any number of arguments in callback', function(done) {
            changelog.run([
                { name: 'third', changeset: function(cb) { console.log(1); cb(1,2,3,4); } }
            ], function(err, executed) {
                executed.should.have.a.lengthOf(1);
                done(err);
            });
        });
    });
});


