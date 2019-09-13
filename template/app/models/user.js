const StoreIPAddress = require('@ladjs/store-ip-address');
const captainHook = require('captain-hook');
const isSANB = require('is-string-and-not-blank');
const mongoose = require('mongoose');
const mongooseCommonPlugin = require('mongoose-common-plugin');
const passportLocalMongoose = require('passport-local-mongoose');
const randomstring = require('randomstring-extended');
const validator = require('validator');
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
  },
  full_email: {
    type: String,
    required: true,
    trim: true
  },

  // api token for basic auth
  api_token: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    unique: true,
    index: true
  },

  // password reset
  reset_token_expires_at: Date,
  reset_token: String
});

// additional variable based properties to add to the schema
const obj = {};

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
obj[fields.googleProfileID] = {
  type: String,
  index: true
};
obj[fields.googleAccessToken] = String;
obj[fields.googleRefreshToken] = String;

// shared field names with @ladjs/i18n and email-templates
obj[config.lastLocaleField] = {
  type: String,
  default: i18n.config.defaultLocale
};

// finally add the fields
User.add(obj);

User.pre('validate', function(next) {
  // create api token if doesn't exist
  if (!isSANB(this.api_token)) this.api_token = randomstring.token(24);

  // set the user's display name to their email address
  // but if they have a name or surname set then use that
  this[fields.displayName] = this.email;
  if (isSANB(this[fields.givenName]) || isSANB(this[fields.familyName])) {
    this[fields.displayName] = `${this[fields.givenName] || ''} ${this[
      fields.familyName
    ] || ''}`;
  }

  // set the user's full email address (incl display name)
  this.full_email = this[fields.displayName]
    ? `${this[fields.displayName]} <${this.email}>`
    : this.email;

  next();
});

User.plugin(captainHook);

User.postCreate(async (user, next) => {
  // add welcome email job
  try {
    const job = await bull.add('email', {
      template: 'welcome',
      message: {
        to: user.full_email
      },
      locals: {
        user: select(user.toObject(), User.options.toJSON.select)
      }
    });
    logger.info('added job', bull.getMeta({ job }));
  } catch (err) {
    logger.error(err);
  }

  next();
});

User.plugin(mongooseCommonPlugin, { object: 'user' });
User.plugin(passportLocalMongoose, config.passportLocalMongoose);
User.plugin(storeIPAddress.plugin);

module.exports = mongoose.model('User', User);
