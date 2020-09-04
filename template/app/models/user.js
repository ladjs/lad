const Boom = require('@hapi/boom');
const _ = require('lodash');
const captainHook = require('captain-hook');
const cryptoRandomString = require('crypto-random-string');
const isSANB = require('is-string-and-not-blank');
const dayjs = require('dayjs');
const relativeTime = require('dayjs/plugin/relativeTime');
const updateLocale = require('dayjs/plugin/updateLocale');
const mongoose = require('mongoose');
const mongooseCommonPlugin = require('mongoose-common-plugin');
const mongooseOmitCommonFields = require('mongoose-omit-common-fields');
const passportLocalMongoose = require('passport-local-mongoose');
const validator = require('validator');
const { authenticator } = require('otplib');
const { boolean } = require('boolean');

// <https://github.com/Automattic/mongoose/issues/5534>
mongoose.Error.messages = require('@ladjs/mongoose-error-messages');

const logger = require('../../helpers/logger');
const config = require('../../config');
const i18n = require('../../helpers/i18n');

if (config.passportLocalMongoose.usernameField !== 'email')
  throw new Error(
    'User model and @ladjs/passport requires that the usernameField is email'
  );

const options = { length: 10, type: 'numeric' };
const { fields } = config.passport;
const omitExtraFields = [
  ..._.without(mongooseOmitCommonFields.underscored.keys, 'email'),
  config.userFields.apiToken,
  config.userFields.resetTokenExpiresAt,
  config.userFields.resetToken,
  config.userFields.changeEmailTokenExpiresAt,
  config.userFields.changeEmailToken,
  config.userFields.changeEmailNewAddress,
  config.userFields.hasSetPassword,
  config.userFields.hasVerifiedEmail,
  config.userFields.verificationPinExpiresAt,
  config.userFields.verificationPin,
  config.userFields.verificationPinSentAt,
  config.userFields.welcomeEmailSentAt,
  config.userFields.otpRecoveryKeys,
  config.userFields.pendingRecovery,
  config.userFields.accountUpdates,
  config.userFields.twoFactorReminderSentAt,
  fields.otpEnabled,
  fields.otpToken
];

// set relative threshold for messages
dayjs.extend(updateLocale, { thresholds: [{ l: 'ss', r: 5 }] });
dayjs.extend(relativeTime);

const User = new mongoose.Schema({
  // group permissions
  group: {
    type: String,
    default: 'user',
    enum: ['admin', 'user'],
    lowercase: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    index: true,
    trim: true,
    lowercase: true,
    unique: true,
    validate: (value) => validator.isEmail(value)
  }
});

// additional variable based properties to add to the schema
const object = {};

// two factor auth reminders
object[config.userFields.twoFactorReminderSentAt] = Date;

object[config.userFields.fullEmail] = {
  type: String,
  required: true,
  trim: true
};

// api token for basic auth
object[config.userFields.apiToken] = {
  type: String,
  required: true,
  lowercase: true,
  trim: true,
  unique: true,
  index: true
};

object[config.userFields.otpRecoveryKeys] = Array;

// password reset
object[config.userFields.resetTokenExpiresAt] = Date;
object[config.userFields.resetToken] = String;

// email change
object[config.userFields.changeEmailTokenExpiresAt] = Date;
object[config.userFields.changeEmailToken] = String;
object[config.userFields.changeEmailNewAddress] = String;

// welcome email
object[config.userFields.welcomeEmailSentAt] = Date;

// account verification
object[config.userFields.hasSetPassword] = {
  type: Boolean,
  default: false // manually set to true during web/API signup
};
object[config.userFields.hasVerifiedEmail] = {
  type: Boolean,
  default: true // manually set to false during web/API signup
};
object[config.userFields.verificationPinExpiresAt] = Date;
object[config.userFields.verificationPinSentAt] = Date;
object[config.userFields.verificationPin] = {
  type: String,
  trim: true,
  validate: (value) => isSANB(value) && value.replace(/\D/g, '').length === 6
};

object[config.userFields.pendingRecovery] = {
  type: Boolean,
  default: false
};

object[config.userFields.pendingRecovery] = {
  type: Boolean,
  default: false
};

// list of account updates that are batched every 1 min.
object[config.userFields.accountUpdates] = Array;

object[config.userFields.accountUpdates] = Array;

// shared field names with @ladjs/passport for consistency
object[fields.displayName] = {
  type: String,
  required: true,
  trim: true,
  maxlength: 70
};
object[fields.givenName] = {
  type: String,
  trim: true,
  maxlength: 35
};
object[fields.familyName] = {
  type: String,
  trim: true,
  maxlength: 35
};
object[fields.avatarURL] = {
  type: String,
  trim: true,
  validate: (value) => validator.isURL(value)
};
// google
object[fields.googleProfileID] = {
  type: String,
  index: true
};
object[fields.googleAccessToken] = String;
object[fields.googleRefreshToken] = String;
// github
object[fields.githubProfileID] = {
  type: String,
  index: true
};
object[fields.githubAccessToken] = String;
object[fields.githubRefreshToken] = String;

object[fields.otpEnabled] = {
  type: Boolean,
  default: false
};
object[fields.otpToken] = String;

// shared field names with @ladjs/i18n and email-templates
object[config.lastLocaleField] = {
  type: String,
  default: i18n.config.defaultLocale
};

// finally add the fields
User.add(object);

User.plugin(captainHook);

User.virtual(config.userFields.verificationPinHasExpired).get(function () {
  return boolean(
    !this[config.userFields.verificationPinExpiresAt] ||
      new Date(this[config.userFields.verificationPinExpiresAt]).getTime() <
        Date.now()
  );
});

User.pre('validate', async function (next) {
  try {
    // create api token if doesn't exist
    if (!isSANB(this[config.userFields.apiToken]))
      this[config.userFields.apiToken] = await cryptoRandomString.async({
        length: 24
      });

    // set the user's display name to their email address
    // but if they have a name or surname set then use that
    this[fields.displayName] = this.email;
    if (isSANB(this[fields.givenName]) || isSANB(this[fields.familyName])) {
      this[fields.displayName] = `${this[fields.givenName] || ''} ${
        this[fields.familyName] || ''
      }`;
    }

    // set the user's full email address (incl display name)
    this[config.userFields.fullEmail] =
      this[fields.displayName] && this[fields.displayName] !== this.email
        ? `${this[fields.displayName]} <${this.email}>`
        : this.email;

    // if otp authentication values no longer valid
    // then disable it completely
    if (
      !Array.isArray(this[config.userFields.otpRecoveryKeys]) ||
      !this[config.userFields.otpRecoveryKeys] ||
      this[config.userFields.otpRecoveryKeys].length === 0 ||
      !this[config.passport.fields.otpToken]
    )
      this[fields.otpEnabled] = false;

    if (
      !Array.isArray(this[config.userFields.otpRecoveryKeys]) ||
      this[config.userFields.otpRecoveryKeys].length === 0
    )
      this[config.userFields.otpRecoveryKeys] = await Promise.all(
        new Array(10).fill().map(() => cryptoRandomString.async(options))
      );

    if (!this[config.passport.fields.otpToken])
      this[config.passport.fields.otpToken] = authenticator.generateSecret();

    next();
  } catch (err) {
    next(err);
  }
});

//
// NOTE: you should not call this method directly
// instead you should use the helper located at
// `../helpers/send-verification-email.js`
//
User.methods.sendVerificationEmail = async function (ctx, reset = false) {
  if (
    this[config.userFields.hasVerifiedEmail] &&
    boolean(!this[config.userFields.pendingRecovery])
  )
    return this;

  if (reset) {
    this[config.userFields.verificationPinExpiresAt] = this[
      `__${config.userFields.verificationPinExpiresAt}`
    ];
    this[config.userFields.verificationPinSentAt] = this[
      `__${config.userFields.verificationPinSentAt}`
    ];
    this[config.userFields.verificationPin] = this[
      `__${config.userFields.verificationPin}`
    ];
    await this.save();
    return this;
  }

  // store old values in case we have to reset
  this[`__${config.userFields.verificationPinExpiresAt}`] = this[
    config.userFields.verificationPinExpiresAt
  ];
  this[`__${config.userFields.verificationPinSentAt}`] = this[
    config.userFields.verificationPinSentAt
  ];
  this[`__${config.userFields.verificationPin}`] = this[
    config.userFields.verificationPin
  ];

  const diff =
    this[config.userFields.verificationPinExpiresAt] &&
    this[config.userFields.verificationPinSentAt]
      ? Date.now() -
        new Date(this[config.userFields.verificationPinSentAt]).getTime()
      : false;
  const sendNewEmail =
    this[config.userFields.verificationPinHasExpired] ||
    (diff && diff >= config.verificationPinEmailIntervalMs);

  // ensure the user waited as long as necessary to send a new pin email
  if (!sendNewEmail) {
    const message = i18n.api.t(
      {
        phrase: config.i18n.phrases.EMAIL_VERIFICATION_INTERVAL,
        locale: this[config.lastLocaleField]
      },
      dayjs
        .duration(config.verificationPinEmailIntervalMs - diff)
        .locale(this[config.lastLocaleField])
        .humanize()
    );
    if (ctx) {
      const err = Boom.badRequest(message);
      err.no_translate = true;
      throw err;
    }

    const err = new Error(message);
    err.no_translate = true;
    throw err;
  }

  if (this[config.userFields.verificationPinHasExpired]) {
    this[config.userFields.verificationPinExpiresAt] = new Date(
      Date.now() + config.verificationPinTimeoutMs
    );
    this[config.userFields.verificationPin] = await cryptoRandomString.async(
      config.verificationPin
    );
  }

  this[config.userFields.verificationPinSentAt] = new Date();
  await this.save();

  return this;
};

User.plugin(mongooseCommonPlugin, {
  object: 'user',
  omitCommonFields: false,
  omitExtraFields,
  mongooseHidden: {
    virtuals: {
      [config.userFields.verificationPinHasExpired]: 'hide'
    }
  }
});

User.plugin(passportLocalMongoose, config.passportLocalMongoose);

User.post('init', (doc) => {
  for (const field of config.accountUpdateFields) {
    const fieldName = _.get(config, field);
    doc[`__${fieldName}`] = doc[fieldName];
  }
});

User.pre('save', function (next) {
  // filter by allowed field updates (otp enabled, profile updates, etc)
  for (const field of config.accountUpdateFields) {
    const fieldName = _.get(config, field);
    if (this[`__${fieldName}`] && this[`__${fieldName}`] !== this[fieldName]) {
      this[config.userFields.accountUpdates].push({
        fieldName,
        current: this[fieldName],
        previous: this[`__${fieldName}`]
      });
      // reset so we don't get into infinite loop
      this[`__${fieldName}`] = this[fieldName];
    }
  }

  next();
});

User.postCreate((user, next) => {
  logger.info('user created', {
    user: user.toObject(),
    slack: true
  });
  next();
});

module.exports = mongoose.model('User', User);
