const mongoose = require('@ladjs/mongoose');
const Frisbee = require('frisbee');

const { Users } = require('../app/models');
const api = require('../api');
const web = require('../web');

mongoose.configure();
mongoose.connect().then();

global.Users = Users;
global.api = api.listen();
global.web = web.listen();
global.mongoose = mongoose;
global.apiRequest = new Frisbee({
  baseURI: `http://localhost:${global.api.address().port}`,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
});
global.webRequest = new Frisbee({
  baseURI: `http://localhost:${global.web.address().port}`,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
});
