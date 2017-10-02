const Cacti = require('cacti');

const cacti = new Cacti();

module.exports = async function(job, done) {
  try {
    await cacti.backup();
    done();
  } catch (err) {
    done(err);
  }
};
