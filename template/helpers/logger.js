const Axe = require('axe');

const loggerConfig = require('../config/logger');

const logger = new Axe(loggerConfig);

module.exports = logger;
