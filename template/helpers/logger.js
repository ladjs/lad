const Axe = require('axe');

const config = require('../config');

const logger = new Axe(config.logger);

module.exports = logger;
