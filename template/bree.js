// eslint-disable-next-line import/no-unassigned-import
require('./config/env');

const Bree = require('bree');
const Graceful = require('@ladjs/graceful');

const logger = require('./helpers/logger');

const bree = new Bree({ logger });

if (!module.parent) {
  const graceful = new Graceful({
    brees: [bree],
    logger
  });
  graceful.listen();

  bree.start();

  logger.info('Lad bree started');
}

module.exports = bree;
