const Email = require('email-templates');
const _ = require('lodash');

const { getEmailLocals, logger } = require('../helpers');
const config = require('../config');

const email = new Email(config.email);

module.exports = async job => {
  try {
    logger.info('sending email', { job });
    if (!_.isObject(job.data.locals)) job.data.locals = {};
    const emailLocals = await getEmailLocals();
    Object.assign(job.data.locals, emailLocals);
    const res = await email.send(job.data);
    logger.info('email response', { res });
  } catch (err) {
    logger.error(err);
    throw err;
  }
};
