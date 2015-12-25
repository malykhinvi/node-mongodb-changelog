'use strict';

var MongoClient = require('mongodb').MongoClient,
    async = require('async'),
    HashError = require('./error').HashError,
    AlreadyAppliedError = require('./error').AlreadyAppliedError,
    Task = require('./task'),
    DatabasechangelogContext = require('./context');

module.exports = function(config) {

    var mongo_url = config.url,
        mongo_connection_config = config.mongo_connection_config,
        logger = require('./logger').use(config.logger);

    // Accepts array of tasks ([{name: 'taskName', changeset: functionName}])

    function run(tasks, mainCallback) {
        async.waterfall([
            connect,
            prepareDatabasechangelogCollection,
            executeTasks
        ], function(err, processedTasks) {
            if (err) { logger.log(err); }
            else { logger.log(processedTasks); }
            mainCallback(err, processedTasks);
        });

        function connect(callback) {
            MongoClient.connect(mongo_url, mongo_connection_config, callback)
        }

        function prepareDatabasechangelogCollection(db, callback) {
            var databasechangelog = db.collection('databasechangelog');
            databasechangelog.ensureIndex({ 'name' : 1 }, function(err) {
                callback(err, databasechangelog);
            });
        }

        function executeTasks(databasechangelog, callback) {
            var taskWrappers = tasks.map(function(t) { return new Task(t); }),
                context = new DatabasechangelogContext(databasechangelog);

            async.eachSeries(taskWrappers, function(task, iteratorCallback) {

                async.waterfall([
                    task.validateTask.bind(task),
                    context.find.bind(context, task),
                    _checkHash.bind(null, task),
                    task.apply.bind(task),
                    context.save.bind(context, task)
                ], function(err) {
                    if (err instanceof AlreadyAppliedError) {
                        iteratorCallback();
                    } else {
                        iteratorCallback(err);
                    }
                });

            }, function(err) {
                callback(err, taskWrappers.filter(function(t) { return t.isApplied; }));
            });
        }

        function _checkHash(wrapper, changeset, callback) {
            if (changeset) {
                if (wrapper.md5sum !== changeset.md5sum) {
                    callback(new HashError(changeset, wrapper.md5sum));
                } else {
                    callback(new AlreadyAppliedError());
                }
            } else {
                callback();
            }
        }

    }

    return {
        run : run
    };

};