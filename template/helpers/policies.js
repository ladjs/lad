const Policies = require('@ladjs/policies');

const { appName } = require('../config');
const { Users } = require('../app/models');

const policies = new Policies({ appName }, api_token =>
  Users.findOne({ api_token })
);

module.exports = policies;
