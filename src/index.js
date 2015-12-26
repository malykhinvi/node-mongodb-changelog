'use strict';

const crypto = require('crypto');
const MongoClient = require('mongodb').MongoClient;
const co = require('co');
const IllegalTaskFormat = require('./error').IllegalTaskFormat;
const HashError = require('./error').HashError;

const Statuses = {
    ALREADY_APPLIED: 'ALREADY_APPLIED',
    SUCCESSFULLY_APPLIED: 'SUCCESSFULLY_APPLIED'
};

/**
 * Run migrations/tasks against database, specified by config.
 * @param {Object} config
 * @param {Object[]} tasks
 * @param {string} tasks[].name - unique name of the task
 * @param {function} tasks[].operation - function, returning yieldable value (https://github.com/tj/co#yieldables)
 * @returns {Promise} resolved with hash (taskName: Status), or rejected with en error occurred
 */
function runMigrations(config, tasks) {
    return co(function* () {
        const db = yield MongoClient.connect(config.mongoUrl, config.mongoConnectionConfig);
        const databasechangelog = db.collection('databasechangelog');
        yield databasechangelog.createIndex({name: 1}, {unique: true});

        const result = {};
        for (let i = 0; i < tasks.length; i++) {
            const task = tasks[i];
            let status = yield* processTask(task, databasechangelog);
            result[task.name] = status;
        }
        yield db.close();

        return result;
    });
}

/**
 * Process new task. Check hash of applied tasks.
 * @param {Object} task
 * @param {mongodb collection} databasechangelog - changelog collection
 * @throws {IllegalTaskFormat} task should have "name" and "operation"
 * @throws {HashError} Already applied tasks should not be modified.
 * @returns Status
 */
function* processTask(task, databasechangelog) {
    if (!isTaskValid(task)) {
        throw new IllegalTaskFormat();
    }

    const storedTask = yield databasechangelog.findOne({name: task.name});
    const md5sum = getMD5Sum(task);
    let status;
    if (storedTask) {
        if (storedTask.md5sum !== md5sum) {
            throw new HashError(task, md5sum);
        } else {
            status = Statuses.ALREADY_APPLIED;
        }
    } else {
        yield task.operation();
        const appliedChange = {
            name: task.name,
            dateExecuted: new Date(),
            md5sum: md5sum
        };
        yield databasechangelog.insert(appliedChange);
        status = Statuses.SUCCESSFULLY_APPLIED;
    }
    return status;
}

function isTaskValid(task) {
    return task.name && task.operation && task.operation instanceof Function;
}

function getMD5Sum(task) {
    return crypto.createHash('md5').update(task.operation.toString()).digest('hex');
}

module.exports = runMigrations;
module.exports.Statuses = Statuses;
