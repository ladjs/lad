const Boom = require('@hapi/boom');
const StoreIPAddress = require('@ladjs/store-ip-address');
const cryptoRandomString = require('crypto-random-string');
const isSANB = require('is-string-and-not-blank');
const moment = require('moment');
const mongoose = require('mongoose');
const mongooseCommonPlugin = require('mongoose-common-plugin');
const passportLocalMongoose = require('passport-local-mongoose');
const validator = require('validator');
const { authenticator } = require('otplib');
const { boolean } = require('boolean');
const { select } = require('mongoose-json-select');

// <https://github.com/Automattic/mongoose/issues/5534>
mongoose.Error.messages = require('@ladjs/mongoose-error-messages');

const config = require('../../config');
const i18n = require('../../helpers/i18n');
const logger = require('../../helpers/logger');
const bull = require('../../bull');

const opts = { length: 10, characters: '1234567890' };
const storeIPAddress = new StoreIPAddress({
  logger,
  ...config.storeIPAddress
});

if (config.passportLocalMongoose.usernameField !== 'email')
  throw new Error(
    'User model and @ladjs/passport requires that the usernameField is email'
  );

// set relative threshold for messages
moment.relativeTimeThreshold('ss', 5);

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
    validate: value => validator.isEmail(value)
  },

  // password reset
  reset_token_expires_at: Date,
  reset_token: String,
  has_set_password: {
    type: Boolean,
    default: false
  }
});

// additional variable based properties to add to the schema
const object = {};

// user fields
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
  validate: value => isSANB(value) && value.replace(/\D/g, '').length === 6
};
object[config.userFields.pendingRecovery] = {
  type: Boolean,
  default: false
};

// shared field names with @ladjs/passport for consistency
const { fields } = config.passport;
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
  validate: value => validator.isURL(value)
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

User.virtual(config.userFields.verificationPinHasExpired).get(function() {
  return boolean(
    !this[config.userFields.verificationPinExpiresAt] ||
      new Date(this[config.userFields.verificationPinExpiresAt]).getTime() <
        Date.now()
  );
});

User.pre('validate', function(next) {
  // create api token if doesn't exist
  if (!isSANB(this[config.userFields.apiToken]))
    this[config.userFields.apiToken] = cryptoRandomString({ length: 24 });

  // set the user's display name to their email address
  // but if they have a name or surname set then use that
  this[fields.displayName] = this.email;
  if (isSANB(this[fields.givenName]) || isSANB(this[fields.familyName])) {
    this[fields.displayName] = `${this[fields.givenName] || ''} ${this[
      fields.familyName
    ] || ''}`;
  }

  // set the user's full email address (incl display name)
  this[config.userFields.fullEmail] = this[fields.displayName]
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
    this[config.userFields.otpRecoveryKeys] = new Array(10)
      .fill()
      .map(() => cryptoRandomString(opts));

  if (!this[config.passport.fields.otpToken])
    this[config.passport.fields.otpToken] = authenticator.generateSecret();

  next();
});

User.post('save', async user => {
  // return early if the user already received welcome email
  // or if they have not yet verified their email address
  if (
    user[config.userFields.welcomeEmailSentAt] ||
    !user[config.userFields.hasVerifiedEmail]
  )
    return;

  // add welcome email job
  try {
    const job = await bull.add('email', {
      template: 'welcome',
      message: {
        to: user[config.userFields.fullEmail]
      },
      locals: {
        user: select(user.toObject(), User.options.toJSON.select)
      }
    });
    logger.info('added job', bull.getMeta({ job }));
    user[config.userFields.welcomeEmailSentAt] = new Date();
    await user.save();
  } catch (err) {
    logger.error(err);
  }
});

User.methods.sendVerificationEmail = async function(ctx) {
  if (
    this[config.userFields.hasVerifiedEmail] &&
    boolean(!this[config.userFields.pendingRecovery])
  )
    return this;

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
      moment
        .duration(config.verificationPinEmailIntervalMs - diff)
        .locale(this[config.lastLocaleField])
        .humanize()
    );
    if (ctx) throw Boom.badRequest(message);
    throw new Error(message);
  }

  if (this[config.userFields.verificationPinHasExpired]) {
    this[config.userFields.verificationPinExpiresAt] = new Date(
      Date.now() + config.verificationPinTimeoutMs
    );
    this[config.userFields.verificationPin] = cryptoRandomString(
      config.verificationPin
    );
  }

  this[config.userFields.verificationPinSentAt] = new Date();
  await this.save();

  // attempt to send them an email
  const job = await bull.add('email', {
    template: 'verify',
    message: {
      to: this[config.userFields.fullEmail]
    },
    locals: {
      user: select(this.toObject(), User.options.toJSON.select),
      expiresAt: this[config.userFields.verificationPinExpiresAt],
      pin: this[config.userFields.verificationPin],
      link: `${config.urls.web}${config.verifyRoute}?pin=${
        this[config.userFields.verificationPin]
      }`
    }
  });

  logger.info('added job', bull.getMeta({ job }));

  return this;
};

User.plugin(mongooseCommonPlugin, {
  object: 'user',
  omitExtraFields: [
    config.userFields.apiToken,
    config.userFields.resetTokenExpiresAt,
    config.userFields.resetToken,
    config.userFields.hasSetPassword,
    config.userFields.hasVerifiedEmail,
    config.userFields.verificationPinExpiresAt,
    config.userFields.verificationPin,
    config.userFields.verificationPinHasExpired,
    config.userFields.welcomeEmailSentAt,
    config.userFields.otpRecoveryKeys,
    fields.otpToken
  ]
});
User.plugin(passportLocalMongoose, config.passportLocalMongoose);
User.plugin(storeIPAddress.plugin);

module.exports = mongoose.model('User', User);
