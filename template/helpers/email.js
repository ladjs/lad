const Email = require('email-templates');
const _ = require('lodash');

const config = require('../config');
const getEmailLocals = require('./get-email-locals');
const logger = require('./logger');

const email = new Email(config.email);

module.exports = async (data) => {
  try {
    logger.info('sending email', { data });
    if (!_.isObject(data.locals)) data.locals = {};
    const emailLocals = await getEmailLocals();
    Object.assign(data.locals, emailLocals);
    const res = await email.send(data);
    logger.info('sent email', { res });
    return res;
  } catch (err) {
    logger.error(err);
    throw err;
  }
};
