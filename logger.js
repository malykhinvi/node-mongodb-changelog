'use strict';

var LOGGER = null;

module.exports = {
    use: function(logger) {
        LOGGER = logger;
        return this;
    },
    log: function(value) {
        LOGGER && LOGGER.info(value);
    }
};
