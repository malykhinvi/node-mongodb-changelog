'use strict';

const crypto = require('crypto');
const MongoClient = require('mongodb').MongoClient;
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
async function runMigrations(config, tasks) {
    const client = await MongoClient.connect(config.mongoUrl, config.mongoConnectionConfig);
    const result = {};
    try {
        const db = client.db();
        const changelogCollection = db.collection('databasechangelog');
        await changelogCollection.createIndex({name: 1}, {unique: true});

        for (let i = 0; i < tasks.length; i++) {
            const task = tasks[i];
            result[task.name] = await processTask(task, changelogCollection);
        }
    } catch (err) {
        await client.close();
        throw err;
    }
    await client.close();
    return result;
}

/**
 * Process new task. Check hash of applied tasks.
 * @param {Object} task
 * @param {Collection} changelogCollection - mongodb collection to store changelog in
 * @throws {IllegalTaskFormat} task should have "name" and "operation"
 * @throws {HashError} Already applied tasks should not be modified.
 * @returns Status
 */
async function processTask(task, changelogCollection) {
    if (!isTaskValid(task)) {
        throw new IllegalTaskFormat();
    }

    const storedTask = await changelogCollection.findOne({name: task.name});
    const md5sum = getMD5Sum(task);
    let status;
    if (storedTask) {
        if (storedTask.md5sum !== md5sum) {
            throw new HashError(task, md5sum);
        } else {
            status = Statuses.ALREADY_APPLIED;
        }
    } else {
        await task.operation();
        const appliedChange = {
            name: task.name,
            dateExecuted: new Date(),
            md5sum: md5sum
        };
        await changelogCollection.insertOne(appliedChange);
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
