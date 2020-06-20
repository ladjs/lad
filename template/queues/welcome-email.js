const Graceful = require('@ladjs/graceful');
const Mongoose = require('@ladjs/mongoose');
const dayjs = require('dayjs');
const sharedConfig = require('@ladjs/shared-config');

const config = require('../config');
const logger = require('../helpers/logger');

const bull = require('../bull');

const Users = require('../app/models/user');

const bullSharedConfig = sharedConfig('BULL');

const mongoose = new Mongoose({ ...bullSharedConfig.mongoose, logger });

const graceful = new Graceful({
  mongooses: [mongoose],
  bulls: [bull],
  logger
});

module.exports = async job => {
  try {
    logger.info('welcome email', { job });
    await Promise.all([mongoose.connect(), graceful.listen()]);
    const obj = {
      created_at: {
        $lte: dayjs()
          .subtract(24, 'hours')
          .toDate()
      }
    };
    obj[config.userFields.welcomeEmailSentAt] = { $exists: false };
    obj[config.userFields.hasVerifiedEmail] = true;
    const users = await Users.find(obj);
    await Promise.all(
      users.map(async user => {
        // add welcome email job
        try {
          const job = await bull.add('email', {
            template: 'welcome',
            message: {
              to: user[config.userFields.fullEmail]
            },
            locals: {
              user: user.toObject()
            }
          });
          logger.info('added job', bull.getMeta({ job }));
          user[config.userFields.welcomeEmailSentAt] = new Date();
          await user.save();
        } catch (err) {
          logger.error(err);
        }
      })
    );
  } catch (err) {
    logger.error(err);
    throw err;
  }
};
