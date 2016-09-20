
import mongoose from 'mongoose';

import Logger from './logger';
import config from '../config';

export default class Mongoose {

  constructor() {

    // create the database connection
    mongoose.set('debug', config.mongooseDebug);

    // use native promises
    mongoose.Promise = global.Promise;

    // when the connection is connected
    mongoose.connection.on('connected', () => {
      Logger.info(`mongoose connection open to ${config.mongodb}`);
    });

    // if the connection throws an error
    mongoose.connection.on('error', err => Logger.error);

    // when the connection is disconnected
    mongoose.connection.on('disconnected', () => {
      Logger.info('mongoose disconnected');
    });

    // connect to mongodb
    (async function reconnect() {
      try {
        await mongoose.connect(config.mongodb, config.mongodbOptions);
      } catch (err) {
        Logger.error(err);
        Logger.info(`attempting to reconnect in (${config.mongooseReconnectMs}) ms`);
        setTimeout(reconnect, config.mongooseReconnectMs);
      }
    }());

    return mongoose;

  }

}
