
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
  (async () => await reconnect())();

  return mongoose;

}

function reconnect() {
  return new Promise(async (resolve, reject) => {
    try {
      await mongoose.connect(config.mongodb, config.mongodbOptions);
      resolve();
    } catch (err) {
      logger.error(err);
      logger.info(`attempting to reconnect in (${config.mongooseReconnectMs}) ms`);
      setTimeout(() => {
        resolve(reconnect());
      }, config.mongooseReconnectMs);
    }
  });
}
