const Email = require('email-templates');

const config = require('../config');

const email = new Email(config.email);

module.exports = async job => {
  await email.send(job.data);
};
