'use strict';

class HashError extends Error {
    constructor(task, newHash) {
      super(arguments);
      Error.captureStackTrace(this, HashError);

      this.message = `Wrong md5sum for changeset "${task.name}". Current value is ${newHash}`;
    }
}

class IllegalTaskFormat extends Error {
    constructor() {
      super(arguments);
      Error.captureStackTrace(this, IllegalTaskFormat);

      this.message = 'Wrong task format. Expected { name: "taskname", operation: function }';
    }
}

module.exports = {
    HashError,
    IllegalTaskFormat
};
