export default class DatabaseChangelogContext{
  constructor(collection) {
      this.collection = collection;
  }

  find(task, callback) {
      this.collection.findOne({name : task.name}, function(err, changeset) {
          callback(err, changeset);
      });
  }

  save(wrapper, callback) {
      wrapper.isApplied = true;
      this.collection.insert(wrapper.createLogRecord(), callback);
  }

}
