
import _ from 'lodash';
import s from 'underscore.string';
import randomstring from 'randomstring-extended';
import mongoose from 'mongoose';
import jsonSelect from 'mongoose-json-select';
import validator from 'validator';
import config from '../../config';
import { Logger } from '../../helpers';
import Jobs from './job';

import CommonPlugin from './plugins/common';

const Users = new mongoose.Schema({
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
    validator: validator.isEmail
  },
  display_name: {
    type: String,
    required: true,
    trim: true
  },
  given_name: {
    type: String,
    required: true,
    trim: true
  },
  family_name: {
    type: String,
    required: true,
    trim: true
  },
  avatar_url: {
    type: String,
    required: true,
    trim: true,
    validator: validator.isUrl
  },
  google_profile_id: {
    type: String,
    unique: true,
    index: true
  },
  google_access_token: String,
  google_refresh_token: String,
  api_token: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    unique: true,
    index: true
  }
});

Users.post('save', async user => {
  // send them a welcome email
  try {
    const job = await Jobs.create({
      name: 'email',
      data: {
        template: 'welcome',
        to: user.email,
        locals: {
          name: user.display_name
        }
      }
    });
    Logger.info('created job', job);
  } catch (err) {
    Logger.error(err);
  }
});

Users.pre('validate', function (next) {
  if (!_.isString(this.api_token) || s.isBlank(this.api_token))
    this.api_token = randomstring.token(24);
  next();
});

Users.plugin(CommonPlugin('user'));
Users.plugin(
  jsonSelect,
  config.omitUserFields.map(field => `-${field}`).join(' ')
);

export default mongoose.model('User', Users);
