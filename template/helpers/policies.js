const Policies = require('@ladjs/policies');

const {
  loginOtpRoute,
  verifyRoute,
  userFields,
  passport,
  appName
} = require('../config');
const { Users } = require('../app/models');

const policies = new Policies(
  {
    schemeName: appName,
    userFields,
    passport,
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
