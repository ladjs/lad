const Frisbee = require('frisbee');
const Mongoose = require('@ladjs/mongoose');
const _ = require('lodash');

const api = require('../api');
const web = require('../web');
const config = require('../config');
const logger = require('../helpers/logger');

const mongoose = new Mongoose(
  _.merge(
    {
      logger
    },
    api.config.mongoose,
    config.mongoose,
    {
      mongo: {
        uri: 'mongodb://localhost:27017/lad_test'
      }
    }
  )
);

(async () => {
  try {
    await Promise.all([api.listen(), web.listen(), mongoose.connect()]);
  } catch (err) {
    logger.error(err);
  }
})();

global.config = config;
global.api = new Frisbee({
  baseURI: `http://localhost:${api.server.address().port}`,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
});
global.web = new Frisbee({
  baseURI: `http://localhost:${web.server.address().port}`,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
});
