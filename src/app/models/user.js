
import _ from 'lodash';
import s from 'underscore.string';
import randomstring from 'randomstring-extended';
import mongoose from 'mongoose';
import jsonSelect from 'mongoose-json-select';
import validator from 'validator';
import passportLocalMongoose from 'passport-local-mongoose';

import config from '../../config';
import CommonPlugin from './plugins/common';

const Users = new mongoose.Schema({

  // passport-local-mongoose sets these for us on log in attempts
  attempts: Number,
  last: Date,
  hash: String,
  salt: String,

  group: {
    type: String,
    default: 'user',
    enum: [ 'admin', 'user' ],
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
    required: true,
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

  // oauth

  // google
  google_profile_id: {
    type: String,
    unique: true,
    index: true
  },
  google_access_token: String,
  google_refresh_token: String

});

Users.pre('validate', function (next) {

  // create api token if doesn't exist
  if (!_.isString(this.api_token) || s.isBlank(this.api_token))
    this.api_token = randomstring.token(24);

  // create avatar url using gravatar
  if (!_.isString(this.avatar_url)
    || (_.isString(this.avatar_url) && !validator.isURL(this.avatar_url)))
    this.avatar_url = 'http://google.com';

  if (_.isString(this.email) && (!_.isString(this.display_name) || s.isBlank(this.display_name)))
    this.display_name = this.email.split('@')[0];

  next();

});

Users.plugin(CommonPlugin('user'));
Users.plugin(
  jsonSelect,
  config.omitUserFields.map(field => `-${field}`).join(' ')
);

Users.plugin(passportLocalMongoose, config.auth.strategies.local);

Users.statics.findByEmail = Users.statics.findByUsername;

export default mongoose.model('User', Users);
