const Policies = require('@ladjs/policies');
const { Users } = require('../app/models');

const { appName } = require('../config');

const policies = new Policies({ appName }, api_token => Users.findOne({ api_token }));

module.exports = policies;
