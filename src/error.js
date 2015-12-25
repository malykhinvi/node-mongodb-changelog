export class HashError extends Error {
    constructor(changeset, newHash) {
      super(arguments);
      super.captureStackTrace(this, HashError);

      this.message = `Wrong md5sum for changeset ${changeset.name}. Current value is ${newHash}`;
    }
}

export class AlreadyAppliedError extends Error {
    constructor(changeset, newHash) {
      super(arguments);
      super.captureStackTrace(this, AlreadyAppliedError);

      this.message = `Wrong md5sum for changeset ${changeset.name}. Current value is ${newHash}`;
    }
}

export class IllegalTaskFormat extends Error {
    constructor(changeset, newHash) {
      super(arguments);
      super.captureStackTrace(this, IllegalTaskFormat);

      this.message = 'Wrong task format. Expected { name: "taskname", changeset: changesetFunction }';
    }
}
