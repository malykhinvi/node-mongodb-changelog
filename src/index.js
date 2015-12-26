'use strict';

const crypto = require('crypto');
const MongoClient = require('mongodb').MongoClient;
const co = require('co');
const IllegalTaskFormat = require('./error').IllegalTaskFormat;
const HashError = require('./error').HashError;

function runMigrations(config, tasks) {
    return co(function* () {
        const db = yield MongoClient.connect(config.mongoUrl, config.mongoConnectionConfig);
        const databasechangelog = db.collection('databasechangelog');
        yield databasechangelog.createIndex({name: 1}, {unique: true});

        for (let i = 0; i < tasks.length; i++) {
            yield* processTask(tasks[i], databasechangelog)
        }

        return 'OK';
    }).then(
        result => console.log(result),
        error => console.error(error)
    );
}

function* processTask(task, databasechangelog) {
    if (!isTaskValid(task)) {
        throw new IllegalTaskFormat();
    }

    const storedTask = yield databasechangelog.findOne({name: task.name});
    const md5sum = getMD5Sum(task);
    if (storedTask) {
        if (storedTask.md5sum !== md5sum) {
            throw new HashError(task, md5sum);
        } else {
            console.log(`${task.name} has been already applied`);
        }
    } else {
        yield task.operation();
        const appliedChange = {
            name: task.name,
            dateExecuted: new Date(),
            md5sum: md5sum
        };
        yield databasechangelog.insert(appliedChange)
    }

}

function isTaskValid(task) {
    return task.name && task.operation && task.operation instanceof Function;
}

function getMD5Sum(task) {
    return crypto.createHash('md5').update(task.operation.toString()).digest('hex');
}

module.exports = runMigrations;
