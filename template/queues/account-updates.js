const Graceful = require('@ladjs/graceful');
const Mongoose = require('@ladjs/mongoose');
const sharedConfig = require('@ladjs/shared-config');
const humanize = require('humanize-string');
const titleize = require('titleize');

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
    logger.info('account updates', { job });
    await Promise.all([mongoose.connect(), graceful.listen()]);
    const obj = {
      account_updates: {
        $exists: true,
        $not: { $size: 0 }
      }
    };
    const users = await Users.find(obj);
    // merge and map to actionable email
    await Promise.all(
      users.map(async user => {
        const accountUpdates = user[config.userFields.accountUpdates].map(
          update => {
            const { fieldName, current, previous } = update;
            return {
              name: fieldName,
              text: titleize(humanize(fieldName)),
              current,
              previous
            };
          }
        );

        // add account updates job
        try {
          const job = await bull.add('email', {
            template: 'account-update',
            message: {
              to: user[config.userFields.fullEmail]
            },
            locals: {
              accountUpdates
            }
          });
          logger.info('added job', bull.getMeta({ job }));
          // delete account updates
          user[config.userFields.accountUpdates] = [];
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
