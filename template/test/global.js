const mongoose = require('@ladjs/mongoose');
const Frisbee = require('frisbee');

const { logger } = require('../helpers');
const apiServer = require('../api').listen();
const webServer = require('../web').listen();

mongoose.configure();
mongoose
  .connect()
  .then()
  .catch(logger.error);

global.api = new Frisbee({
  baseURI: `http://localhost:${apiServer.address().port}`,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
});
global.web = new Frisbee({
  baseURI: `http://localhost:${webServer.address().port}`,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
});
