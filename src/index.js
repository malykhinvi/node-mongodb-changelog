'use strict';

const MongoClient = require('mongodb').MongoClient;
const co = require('co');

function runMigrations(config, tasks) {
    return co(function* () {
        const db = yield MongoClient.connect(config.mongoUrl, config.mongoConnectionConfig);
        const databasechangelog = db.collection('databasechangelog');
        yield databasechangelog.createIndex({name: 1}, {unique: true});

        for (let i = 0; i < tasks.length; i++) {
            yield* processTask(db, tasks[i])
        }

        return 'OK';
    }).then(
        result => console.log(result),
        error => console.error(error)
    );
}

function* processTask(db, task) {
    console.log(task.name);
    yield task.operation();
}

module.exports = runMigrations;
