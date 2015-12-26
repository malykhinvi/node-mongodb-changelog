const changelog = require('../src/index');

const config = {mongoUrl: 'mongodb://localhost:27017/test'};
const tasks = [
    {name: 'initDB',           operation: () => Promise.resolve(true)},
    {name: 'addAppAdminUsers', operation: () => Promise.resolve(true)},
    require('./filePerOperation')
];

changelog(config, tasks);