'use strict';

var MongoClient = require('mongodb').MongoClient,
    async = require('async');

module.exports = function(config) {

    var url = config.url;

    // Accepts array of tasks ([{name: 'taskName', changeset: functionName}])
    function run(tasks, callback) {
        MongoClient.connect(url, function(err, db) {
            if (err) { throw err; }
            var databasechangelog = db.collection('databasechangelog');
            databasechangelog.ensureIndex({ 'name' : 1 }, function() {
                async.eachSeries(tasks, function(task, callback) {
                    async.waterfall([
                        _validateTask.bind(null, task),
                        _findChangeset,
                        _checkHash,
                        _applyChangeset,
                        _saveToChangelog
                    ], callback);

                }, callback);
            });

            function _validateTask(task, callback) {
                if (!task.name || !task.changeset) {
                    callback('Ivalid task is provided.');
                } else {
                    callback(null, task);
                }
            }

            function _findChangeset(task, callback) {
                databasechangelog.findOne({name : task.name}, function(err, changeset) {
                    callback(err, task, changeset);
                });
            }

            function _checkHash(task, changeset, callback) {
                if (changeset) {
                    task.alreadyApplied = true;
                }
                callback(null, task);
            }

            function _applyChangeset(task, callback) {
                if (task.alreadyApplied) { return callback(null, task); }
                console.log('Applying changeset ' + task.name);
                task.changeset(function() { callback(null, task);});
            }

            function _saveToChangelog(task, callback) {
                if (task.alreadyApplied) { return callback(null, task); }
                console.log('Changeset ' + task.name + ' finished');
                databasechangelog.insert({name : task.name}, callback);
            }
        });
    }

    return {
        run : run
    };

};