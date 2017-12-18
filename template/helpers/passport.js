const Passport = require('@ladjs/passport');

const config = require('../config');
const { Users } = require('../app/models');

const passport = new Passport(Users, config.passport);

module.exports = passport;
