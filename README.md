[![build status](https://img.shields.io/travis/malykhinvi/node-mongodb-changelog.svg)](https://travis-ci.org/malykhinvi/node-mongodb-changelog)
[![Coverage Status](https://coveralls.io/repos/github/malykhinvi/node-mongodb-changelog/badge.svg?branch=master)](https://coveralls.io/github/malykhinvi/node-mongodb-changelog?branch=master)
[![npm version](https://img.shields.io/npm/v/mongodb-changelog.svg)](https://www.npmjs.com/package/mongodb-changelog)

# Node MongoDB Changelog

> Liquibase inspired mongodb migration tool for Node.js.

## Install
Required Node.js 10+

```npm install mongodb-changelog```

## Usage
```javascript
const changelog = require('mongodb-changelog');

const config = {mongoUrl: 'mongodb://localhost:27017/test'};
const tasks = [
    {
        name: 'initDB',
        operation: () => Promise.resolve(true)
    },
    {
        name: 'addAppAdminUsers',
        operation: (db) => {
            const users = db.collection('users');
            return users.insertOne({username: 'admin', password: 'test', isAdmin: true});
        }
    }
];

changelog(config, tasks);

```
The code above will create collection, called "databasechangelog", and create two records inside (one per each task).
Each record contains name of the task, date of applying of this task and task function md5Sum.

Check out tests for more examples.

## Features
- changeset functions synchronous processing,
- changeset modifications monitoring,
- migrations automatic run,
- async/await support
