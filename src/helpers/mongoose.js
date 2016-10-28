
import mongoose from 'mongoose';

import logger from './logger';
import config from '../config';

export default function _mongoose() {

  // create the database connection
  mongoose.set('debug', config.mongooseDebug);

  // use native promises
  mongoose.Promise = global.Promise;

  // when the connection is connected
  mongoose.connection.on('connected', () => {
    logger.info(`mongoose connection open to ${config.mongodb}`);
  });

  // if the connection throws an error
  mongoose.connection.on('error', err => logger.error);

  // when the connection is disconnected
  mongoose.connection.on('disconnected', () => {
    logger.info('mongoose disconnected');
  });

  // connect to mongodb
  (async function reconnect() {
    try {
      // until this issue is resolved, we have to use `.then`
      // <https://github.com/Automattic/mongoose/issues/4659>
      await mongoose.connect(config.mongodb, config.mongodbOptions).then;
    } catch (err) {
      logger.error(err);
      logger.info(`attempting to reconnect in (${config.mongooseReconnectMs}) ms`);
      setTimeout(reconnect, config.mongooseReconnectMs);
    }
  }());

  return mongoose;

}
