#Node MongoDB Changelog

Liquibase inspired mongodb changelog tool for [node](http://nodejs.org/).

##Features
Currently supported:
- changeset functions synchronous processing,
- changeset's modifications monitoring,

Planned:
- changeset files synchronous processing,
- changeset asynchronous processing (for long migrations).

##Usage
An example can be found [here](https://github.com/malykhinvi/appetit/blob/master/initDB.js#L12)

##Changelog
- **0.1.2** - Fixed changeset callback function format (now it accepts any number of arguments).
- **0.1.1** - Fixed changeset hash error message.
- **0.1.0** - Initial commit.
