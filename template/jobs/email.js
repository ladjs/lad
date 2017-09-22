const Email = require('email-templates');
const config = require('../config');

const email = new Email(config.email);

module.exports = async function(job, done) {
  try {
    await email.send(job.attrs.data);
    done();
  } catch (err) {
    done(err);
  }
};
