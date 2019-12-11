const Boom = require('@hapi/boom');
const StoreIPAddress = require('@ladjs/store-ip-address');
const cryptoRandomString = require('crypto-random-string');
const isSANB = require('is-string-and-not-blank');
const moment = require('moment');
const mongoose = require('mongoose');
const mongooseCommonPlugin = require('mongoose-common-plugin');
const passportLocalMongoose = require('passport-local-mongoose');
const validator = require('validator');
const { boolean } = require('boolean');
const { select } = require('mongoose-json-select');

// <https://github.com/Automattic/mongoose/issues/5534>
mongoose.Error.messages = require('@ladjs/mongoose-error-messages');

const config = require('../../config');
const i18n = require('../../helpers/i18n');
const logger = require('../../helpers/logger');
const bull = require('../../bull');

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
    validate: val => validator.isEmail(val)
  }
});

// additional variable based properties to add to the schema
const obj = {};

// user fields
obj[config.userFields.fullEmail] = {
  type: String,
  required: true,
  trim: true
};

// api token for basic auth
obj[config.userFields.apiToken] = {
  type: String,
  required: true,
  lowercase: true,
  trim: true,
  unique: true,
  index: true
};

// password reset
obj[config.userFields.resetTokenExpiresAt] = Date;
obj[config.userFields.resetToken] = String;

// welcome email
obj[config.userFields.welcomeEmailSentAt] = Date;

// account verification
obj[config.userFields.hasSetPassword] = {
  type: Boolean,
  default: false // manually set to true during web/API signup
};
obj[config.userFields.hasVerifiedEmail] = {
  type: Boolean,
  default: true // manually set to false during web/API signup
};
obj[config.userFields.verificationPinExpiresAt] = Date;
obj[config.userFields.verificationPinSentAt] = Date;
obj[config.userFields.verificationPin] = {
  type: String,
  trim: true,
  validate: val => isSANB(val) && val.replace(/\D/g, '').length === 6
};

// shared field names with @ladjs/passport for consistency
const { fields } = config.passport;
obj[fields.displayName] = {
  type: String,
  required: true,
  trim: true,
  maxlength: 70
};
obj[fields.givenName] = {
  type: String,
  trim: true,
  maxlength: 35
};
obj[fields.familyName] = {
  type: String,
  trim: true,
  maxlength: 35
};
obj[fields.avatarURL] = {
  type: String,
  trim: true,
  validate: val => validator.isURL(val)
};
// google
obj[fields.googleProfileID] = {
  type: String,
  index: true
};
obj[fields.googleAccessToken] = String;
obj[fields.googleRefreshToken] = String;
// github
obj[fields.githubProfileID] = {
  type: String,
  index: true
};
obj[fields.githubAccessToken] = String;
obj[fields.githubRefreshToken] = String;

// shared field names with @ladjs/i18n and email-templates
obj[config.lastLocaleField] = {
  type: String,
  default: i18n.config.defaultLocale
};

// finally add the fields
User.add(obj);

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
  if (this[config.userFields.hasVerifiedEmail]) return this;

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
      link: `${config.urls.web}${config.verificationPath}?pin=${
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
    config.userFields.welcomeEmailSentAt
  ]
});
User.plugin(passportLocalMongoose, config.passportLocalMongoose);
User.plugin(storeIPAddress.plugin);

module.exports = mongoose.model('User', User);
