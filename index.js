'use strict';

var MongoClient = require('mongodb').MongoClient,
    async = require('async'),
    crypto = require('crypto'),
    HashError = require('./errors').HashError,
    AlreadyAppliedError = require('./errors').AlreadyAppliedError,
    IllegalTaskFormat = require('./errors').IllegalTaskFormat;

module.exports = function(config) {

    var url = config.url;

    // Accepts array of tasks ([{name: 'taskName', changeset: functionName}])
    function run(tasks, mainCallback) {
        MongoClient.connect(url, function(err, db) {
            if (err) { throw err; }
            var databasechangelog = db.collection('databasechangelog');
            databasechangelog.ensureIndex({ 'name' : 1 }, function() {
                async.eachSeries(tasks, function(task, taskCallback) {

                    async.waterfall([
                        _validateTask.bind(null, task),
                        _findChangeset.bind(null, task),
                        _checkHash.bind(null, task),
                        _applyChangeset.bind(null, task),
                        _saveToChangelog.bind(null, task)
                    ], function(err) {
                        if (err instanceof AlreadyAppliedError) {
                            taskCallback();
                        } else {
                            taskCallback(err);
                        }
                    });

                }, function(err) {
                    mainCallback(err, tasks.filter(function(t) { return t.applied; }));
                });
            });

            function _validateTask(task, callback) {
                if (!task.name || !task.changeset) {
                    callback(new IllegalTaskFormat());
                } else {
                    callback();
                }
            }

            function _findChangeset(task, callback) {
                databasechangelog.findOne({name : task.name}, function(err, changeset) {
                    callback(err, changeset);
                });
            }

            function _checkHash(task, changeset, callback) {
                if (changeset) {
                    var newHash = _getMD5Sum(task);
                    if (newHash !== changeset.md5sum) {
                        callback(new HashError(changeset, newHash));
                    } else {
                        callback(new AlreadyAppliedError());
                    }
                } else {
                    callback();
                }
            }

            function _applyChangeset(task, callback) {
                console.log('Applying changeset ' + task.name);
                task.changeset(function() {
                    callback();
                });
            }

            function _saveToChangelog(task, callback) {
                console.log('Changeset ' + task.name + ' finished');
                task.applied = true;
                databasechangelog.insert(_createLogRecord(task), callback);
            }
        });
    }

    function _createLogRecord(task) {
        return {
            name: task.name,
            dateexecuted: new Date(),
            md5sum: _getMD5Sum(task)
        };
    }

    function _getMD5Sum(task) {
        return crypto.createHash('md5').update(task.changeset.toString()).digest('hex');
    }

    return {
        run : run
    };

};