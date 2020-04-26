const changelog = require('mongodb-changelog');

const config = {mongoUrl: 'mongodb://localhost:27017/test'};
const tasks = [
    {
        name: 'addAppAdminUsers',
        operation: (db) => {
            const users = db.collection('users');
            return users.insertOne({username: 'admin', password: 'test', isAdmin: true});
        }
    },
    require('./filePerOperation')
];

changelog(config, tasks).then(
    res => console.log(res),
    err => console.error(err.message)
);