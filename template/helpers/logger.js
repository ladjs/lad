const Logger = require('@ladjs/logger');
const config = require('../config');

const logger = new Logger(config.logger);

module.exports = logger;
