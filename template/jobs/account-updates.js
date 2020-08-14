// eslint-disable-next-line import/no-unassigned-import
require('../config/env');

const { parentPort } = require('worker_threads');

const Graceful = require('@ladjs/graceful');
const Mongoose = require('@ladjs/mongoose');
const sharedConfig = require('@ladjs/shared-config');
const humanize = require('humanize-string');
const titleize = require('titleize');

const config = require('../config');
const logger = require('../helpers/logger');
const email = require('../helpers/email');

const bree = require('../bree');

const Users = require('../app/models/user');

const breeSharedConfig = sharedConfig('BREE');

const mongoose = new Mongoose({ ...breeSharedConfig.mongoose, logger });

const graceful = new Graceful({
  mongooses: [mongoose],
  brees: [bree],
  logger
});

graceful.listen();

(async () => {
  await mongoose.connect();

  const users = await Users.find({
    account_updates: {
      $exists: true,
      $not: { $size: 0 }
    }
  });

  // merge and map to actionable email
  await Promise.all(
    users.map(async (user) => {
      const accountUpdates = user[config.userFields.accountUpdates].map(
        (update) => {
          const { fieldName, current, previous } = update;
          return {
            name: fieldName,
            text: titleize(humanize(fieldName)),
            current,
            previous
          };
        }
      );

      // send account updates email
      try {
        await email({
          template: 'account-update',
          message: {
            to: user[config.userFields.fullEmail]
          },
          locals: {
            accountUpdates
          }
        });
        // delete account updates
        user[config.userFields.accountUpdates] = [];
        await user.save();
      } catch (err) {
        logger.error(err);
      }
    })
  );

  if (parentPort) parentPort.postMessage('done');
  else process.exit(0);
})();
