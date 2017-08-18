const changelog = require('../src');

const config = {mongoUrl: 'mongodb://localhost:27017/test'};
const tasks = [
    {name: 'initDB',           operation: () => Promise.resolve(true)},
    {name: 'addAppAdminUsers', operation: () => Promise.resolve(true)},
    require('./filePerOperation')
];

async function run() {
    try {
        console.log(await changelog(config, tasks));
    } catch (err) {
        console.error(err.message)
    }
}
run();
