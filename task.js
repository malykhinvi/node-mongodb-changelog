'use strict';

var crypto = require('crypto'),
    logger = require('logger'),
    IllegalTaskFormat = require('error').IllegalTaskFormat;

function _getMD5Sum(changeset) {
    return crypto.createHash('md5').update(changeset.toString()).digest('hex');
}

function Task(task) {
    this.name = task.name;
    this.changeset = task.changeset;
    this.isApplied = false;
    this.md5sum = _getMD5Sum(task.changeset);
}

Task.prototype = {

    validateTask: function(callback) {
        if (!this.name || !this.changeset) {
            callback(new IllegalTaskFormat());
        } else {
            callback();
        }
    },
    apply: function(callback) {
        logger.log('Applying changeset "' + this.name + '".')
        this.changeset(function() {
            logger.log('Applied changeset "' + this.name + '".')
            callback();
        }.bind(this));
    },
    createLogRecord: function() {
        return {
            name: this.name,
            dateexecuted: new Date(),
            md5sum: this.md5sum
        };
    }

};

module.exports = Task;