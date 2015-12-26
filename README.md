[![build status](https://img.shields.io/travis/malykhinvi/node-mongodb-changelog.svg?style=flat-square)](https://travis-ci.org/malykhinvi/node-mongodb-changelog)
[![npm version](https://img.shields.io/npm/v/mongodb-changelog.svg?style=flat-square)](https://www.npmjs.com/package/mongodb-changelog)

#Node MongoDB Changelog

> Liquibase inspired mongodb migration tool for Node.js.

##Install
Required Node.js 4+ since this package uses generators, Promises and other ES2015(ES6) features.

```npm install mongodb-changelog```

##Usage
```javascript
const changelog = require('mongodb-changelog');

const config = {mongoUrl: 'mongodb://localhost:27017/test'};
const tasks = [
    {name: 'initDB',           operation: () => Promise.resolve(true)},
    {name: 'addAppAdminUsers', operation: () => Promise.resolve(true)}
];

changelog(config, tasks);

```
The code above will create collection, called "databasechangelog", and create two records inside (one per each task).
Each record contains name of the task, date of applying of this task and task function md5Sum.

Check out tests for more examples.

##Features
- changeset functions synchronous processing,
- changeset modifications monitoring,
- migrations automatic run
