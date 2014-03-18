'use strict';

var util = require('util');

function HashError(changeset, newHash) {
    Error.apply(this, arguments);
    Error.captureStackTrace(this, HashError);

    this.message = 'Wrong md5sum for changeset ' + changeset.name + '. Current value is ' + newHash;
}
util.inherits(HashError, Error);

function AlreadyAppliedError() {
    Error.apply(this, arguments);
    Error.captureStackTrace(this, AlreadyAppliedError);
}
util.inherits(AlreadyAppliedError, Error);

function IllegalTaskFormat() {
    Error.apply(this, arguments);
    Error.captureStackTrace(this, IllegalTaskFormat);

    this.message = 'Wrong task format. Expected { name: "taskname", changeset: changesetFunction }';
}
util.inherits(IllegalTaskFormat, Error);

module.exports.HashError = HashError;
module.exports.AlreadyAppliedError = AlreadyAppliedError;
module.exports.IllegalTaskFormat = IllegalTaskFormat;
