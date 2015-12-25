import crypto from 'crypto';
import logger from './logger';
import {IllegalTaskFormat} from './error';

function getMD5Sum(changeset) {
    return crypto.createHash('md5').update(changeset.toString()).digest('hex');
}

export default class Task {
  constructor(task) {
      this.name = task.name;
      this.changeset = task.changeset;
      this.isApplied = false;
      this.md5sum = getMD5Sum(task.changeset);
  }

  validateTask(callback) {
      if (!this.name || !this.changeset) {
          callback(new IllegalTaskFormat());
      } else {
          callback();
      }
  }

  apply(callback) {
      logger.log('Applying changeset "' + this.name + '".')
      this.changeset(function() {
          logger.log('Applied changeset "' + this.name + '".')
          callback();
      }.bind(this));
  }

  createLogRecord() {
      return {
          name: this.name,
          dateexecuted: new Date(),
          md5sum: this.md5sum
      };
  }
}
