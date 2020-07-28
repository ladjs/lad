// eslint-disable-next-line import/no-unassigned-import
require('../config/env');

const { parentPort } = require('worker_threads');

const Graceful = require('@ladjs/graceful');
const Mongoose = require('@ladjs/mongoose');
const dayjs = require('dayjs');
const sharedConfig = require('@ladjs/shared-config');

const config = require('../config');
const email = require('../helpers/email');
const logger = require('../helpers/logger');
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

  const object = {
    created_at: {
      $lte: dayjs().subtract(1, 'minute').toDate()
    }
  };
  object[config.userFields.welcomeEmailSentAt] = { $exists: false };
  object[config.userFields.hasVerifiedEmail] = true;

  const _ids = await Users.distinct('_id', object);

  // send welcome email
  await Promise.all(
    _ids.map(async (_id) => {
      try {
        const user = await Users.findById(_id);

        // in case user deleted their account
        if (!user) return;

        // in case email was sent for whatever reason
        if (user[config.userFields.welcomeEmailSentAt]) return;

        // send email
        await email({
          template: 'welcome',
          message: {
            to: user[config.userFields.fullEmail]
          },
          locals: { user: user.toObject() }
        });

        // store that we sent this email
        await Users.findByIdAndUpdate(user._id, {
          $set: {
            [config.userFields.welcomeEmailSentAt]: new Date()
          }
        });
        await user.save();
      } catch (err) {
        logger.error(err);
      }
    })
  );

  if (parentPort) parentPort.postMessage('done');
  else process.exit(0);
})();
