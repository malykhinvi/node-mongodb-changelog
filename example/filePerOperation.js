module.exports = {
    name: 'externalOperation',
    operation: function (db) {
        const collection = db.collection('posts');
        return collection.insertOne({title: 'Welcome', content: 'This is the test post'});
    }
};