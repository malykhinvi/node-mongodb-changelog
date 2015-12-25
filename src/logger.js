let LOGGER = null;

export default = {
    use(logger) {
        LOGGER = logger;
        return this;
    }
    log(value) {
        LOGGER && LOGGER.info(value);
    }
};
