const validator = require('validator');
const s = require('underscore.string');
const randomstring = require('randomstring-extended');
const mongoose = require('mongoose');
const mongooseCommonPlugin = require('mongoose-common-plugin');
const passportLocalMongoose = require('passport-local-mongoose');

const config = require('../../config');
const i18n = require('../../helpers/i18n');

const User = new mongoose.Schema({
  // group permissions
  group: {
    type: String,
    default: 'user',
    enum: ['admin', 'user'],
    lowercase: true,
    trim: true
  },

  // TODO: we should configure this with passport-local-mongoose
  // username field so that it is consistent when passed along
  email: {
    type: String,
    required: true,
    index: true,
    trim: true,
    lowercase: true,
    unique: true,
    validate: val => validator.isEmail(val)
  },

  // TODO: these keys should get passed along to @ladjs/auth
  display_name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 70
  },
  given_name: {
    type: String,
    trim: true,
    maxlength: 35
  },
  family_name: {
    type: String,
    trim: true,
    maxlength: 35
  },
  avatar_url: {
    type: String,
    trim: true,
    validate: val => validator.isURL(val)
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
  reset_token: String,

  // last locale
  last_locale: {
    type: String,
    default: i18n.config.defaultLocale
  },

  // authentication

  // google
  // TODO: these keys should get stored in a plugin
  // and also passed along to @ladjs/auth for the naming convention
  google_profile_id: {
    type: String,
    index: true
  },
  google_access_token: String,
  google_refresh_token: String,

  // last ip information
  // TODO: this should be part of store-ip-address package
  last_ips: [
    {
      type: String,
      trim: true,
      validate: val => validator.isIP(val)
    }
  ],
  ip: {
    type: String,
    trim: true,
    validate: val => validator.isIP(val)
  }
});

User.pre('validate', function(next) {
  // create api token if doesn't exist
  if (s.isBlank(this.api_token)) this.api_token = randomstring.token(24);

  // set the user's display name to their email address
  // but if they have a name or surname set then use that
  this.display_name = this.email;
  if (!s.isBlank(this.given_name) || !s.isBlank(this.family_name))
    this.display_name = `${this.given_name || ''} ${this.family_name || ''}`;

  next();
});

User.plugin(mongooseCommonPlugin, { object: 'user' });
User.plugin(passportLocalMongoose, config.passportLocalMongoose);

// https://github.com/saintedlama/passport-local-mongoose/issues/218
User.statics.registerAsync = function(data, password) {
  return new Promise((resolve, reject) => {
    this.register(data, password, (err, user) => {
      if (err) return reject(err);
      resolve(user);
    });
  });
};

module.exports = mongoose.model('User', User);
