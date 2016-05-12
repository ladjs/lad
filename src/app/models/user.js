
import mongoose from 'mongoose';
import jsonSelect from 'mongoose-json-select';
import validator from 'validator';

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
  google_oauth_profile_id: {
    type: String,
    unique: true,
    index: true
  },
  google_oauth_access_token: String,
  google_oauth_refresh_token: String
});

Users.post('save', user => {
  // TODO: send them a welcome email
});

Users.plugin(CommonPlugin('user'));
Users.plugin(
  jsonSelect,
  [
    // local auth strategy fields
    // (defaults as provided by `passport-local-mongoose`)
    '-hash',
    '-salt',
    // oauth strategy tokens
    '-google_oauth_access_token',
    '-google_oauth_refresh_token'
  ].join(' ')
);

export default mongoose.model('User', Users);
