// eslint-disable-next-line import/no-unassigned-import
require('../config/env');

const os = require('os');
const { parentPort } = require('worker_threads');

const Graceful = require('@ladjs/graceful');
const Mongoose = require('@ladjs/mongoose');
const dayjs = require('dayjs');
const pMap = require('p-map');
const sharedConfig = require('@ladjs/shared-config');

const config = require('../config');
const email = require('../helpers/email');
const logger = require('../helpers/logger');
const bree = require('../bree');
const Users = require('../app/models/user');
const Domains = require('../app/models/domain');

const breeSharedConfig = sharedConfig('BREE');
const concurrency = os.cpus().length;
const mongoose = new Mongoose({ ...breeSharedConfig.mongoose, logger });
const graceful = new Graceful({
  mongooses: [mongoose],
  brees: [bree],
  logger
});
const threeMonthsAgo = dayjs().subtract(3, 'months').toDate();

// store boolean if the job is cancelled
let isCancelled = false;

// handle cancellation (this is a very simple example)
if (parentPort)
  parentPort.once('message', (message) => {
    //
    // TODO: once we can manipulate concurrency option to p-map
    // we could make it `Number.MAX_VALUE` here to speed cancellation up
    // <https://github.com/sindresorhus/p-map/issues/28>
    //
    if (message === 'cancel') isCancelled = true;
  });

graceful.listen();

async function mapper(_id) {
  // return early if the job was already cancelled
  if (isCancelled) return;

  try {
    const user = await Users.findById(_id);

    // user could have been deleted in the interim
    if (!user) return;

    // check if they already enabled it
    // in the interim if so return early
    if (user[config.passport.fields.otpEnabled]) return;

    // in case email was sent for whatever reason
    if (user[config.userFields.twoFactorReminderSentAt]) return;

    // send email
    await email({
      template: 'two-factor-reminder',
      message: {
        to: user[config.userFields.fullEmail]
      },
      locals: { user: user.toObject() }
    });

    // store that we sent this email
    await Users.findByIdAndUpdate(user._id, {
      $set: {
        [config.userFields.twoFactorReminderSentAt]: new Date()
      }
    });
  } catch (err) {
    logger.error(err);
  }
}

(async () => {
  await mongoose.connect();

  const _ids = await Domains.distinct('members.user', {
    plan: {
      $ne: 'free'
    }
  });

  // filter for users that do not have two-factor auth set up yet
  const userIds = await Users.distinct('_id', {
    $and: [
      {
        _id: { $in: _ids }
      },
      {
        $or: [
          {
            [config.userFields.twoFactorReminderSentAt]: {
              $exists: false
            }
          },
          {
            [config.userFields.twoFactorReminderSentAt]: {
              $lte: threeMonthsAgo
            }
          }
        ]
      },
      {
        [config.passport.fields.otpEnabled]: false
      }
    ]
  });

  logger.info('sending reminders', { count: userIds.length, _ids });

  // send emails and update `two_factor_reminder_sent_at` date
  await pMap(userIds, mapper, { concurrency });

  if (parentPort) parentPort.postMessage('done');
  else process.exit(0);
})();
