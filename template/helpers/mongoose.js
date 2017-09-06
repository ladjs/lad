const mongoose = require('mongoose');

const config = require('../config');
const logger = require('./logger');
const stopAgenda = require('./stop-agenda');

// use native promises
mongoose.Promise = global.Promise;

function Mongoose(agenda) {
  // create the database connection
  mongoose.set('debug', config.mongooseDebug);

  // when the connection is connected
  mongoose.connection.on('connected', () => {
    logger.info(`mongoose connection open to ${config.mongodb}`);

    // When the connection is connected we need to override
    // the default connection event, because agenda requires
    // us to in order to connect with the same mongoose connection
    if (agenda) {
      // TODO: we need to define the recurring jobs here
      // Re-use existing mongoose connection
      agenda.mongo(
        // <https://github.com/rschmukler/agenda/issues/156#issuecomment-163700272>
        mongoose.connection.collection(config.agenda.collection).conn.db,
        config.agenda.collection,
        err => {
          if (err) return logger.error(err);
          // start accepting new jobs
          agenda.maxConcurrency(config.agenda.maxConcurrency);
          logger.info(
            'agenda opened connection using existing mongoose connection'
          );
        }
      );
    }
  });

  // if the connection throws an error
  mongoose.connection.on('error', logger.error);

  // when the connection is disconnected
  mongoose.connection.on('disconnected', () => {
    logger.info('mongoose disconnected');

    // Similarly when disconnected, we need to ensure that we stop agenda
    if (agenda)
      stopAgenda(agenda, err => {
        if (err) return logger.error(err);
        logger.info('gracefully stopped agenda due to mongoose disconnect');
      });
  });

  // connect to mongodb
  // TODO: replace with top level await?
  (async () => {
    await reconnect();
  })();

  return mongoose;
}

function reconnect() {
  return new Promise(async resolve => {
    try {
      await mongoose.connect(config.mongodb, config.mongodbOptions);
      resolve();
    } catch (err) {
      logger.error(err);
      logger.info(
        `attempting to reconnect in (${config.mongooseReconnectMs}) ms`
      );
      setTimeout(() => {
        resolve(reconnect());
      }, config.mongooseReconnectMs);
    }
  });
}

module.exports = Mongoose;
