const validator = require('validator');
const _ = require('lodash');
const s = require('underscore.string');
const randomstring = require('randomstring-extended');
const mongoose = require('mongoose');
const mongooseCommonPlugin = require('mongoose-common-plugin');
const passportLocalMongoose = require('passport-local-mongoose');

const i18n = require('../../helpers/i18n');

const User = new mongoose.Schema({
  // passport-local-mongoose sets these for us on log in attempts
  attempts: Number,
  last: Date,
  hash: String,
  salt: String,

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
  google_profile_id: {
    type: String,
    index: true
  },
  google_access_token: String,
  google_refresh_token: String,

  // last ip information
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
  if (!_.isString(this.api_token) || s.isBlank(this.api_token))
    this.api_token = randomstring.token(24);

  if (_.isString(this.email) && (!_.isString(this.display_name) || s.isBlank(this.display_name)))
    this.display_name = this.email.split('@')[0];

  next();
});

User.plugin(mongooseCommonPlugin, { object: 'user' });
User.plugin(passportLocalMongoose, {});

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
