#Node MongoDB Changelog

> Liquibase inspired mongodb migration tool for Node.js.

**NOTE: work in progress, for 0 version refer to specific [branch](https://github.com/malykhinvi/node-mongodb-changelog/tree/v0)**

##Install
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

##Features
- changeset functions synchronous processing,
- changeset modifications monitoring,
- migrations automatic run
