'use strict';

function DatabasechangelogContext(collection) {
    this.collection = collection;
}

DatabasechangelogContext.prototype = {
    find: function(task, callback) {
        this.collection.findOne({name : task.name}, function(err, changeset) {
            callback(err, changeset);
        });
    },
    save: function(wrapper, callback) {
        wrapper.isApplied = true;
        this.collection.insert(wrapper.createLogRecord(), callback);
    }
};

module.exports = DatabasechangelogContext;