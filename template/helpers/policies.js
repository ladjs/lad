const Policies = require('@ladjs/policies');

const {
  loginOtpRoute,
  verifyRoute,
  userFields,
  appName
} = require('../config');
const { Users } = require('../app/models');

const policies = new Policies(
  {
    schemeName: appName,
    userFields,
    verifyRoute,
    loginOtpRoute
  },
  apiToken => {
    const query = {};
    query[userFields.apiToken] = apiToken;
    return Users.findOne(query);
  }
);

module.exports = policies;
