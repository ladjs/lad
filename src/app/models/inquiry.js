
import mongoose from 'mongoose';
import validator from 'validator';
import _ from 'lodash';

import config from '../../config';
import CommonPlugin from './plugins/common';

const Inquiry = new mongoose.Schema({
  ip: {
    type: String,
    required: true,
    index: true,
    validate: val => validator.isIP(val)
  },
  email: {
    type: String,
    required: true,
    index: true,
    validate: val => validator.isEmail(val)
  },
  message: {
    type: String,
    required: true,
    validate: val => _.isString(val) && val.length <= config.contactRequestMaxLength
  },
  is_email_only: {
    type: Boolean,
    default: false
  }
});

Inquiry.plugin(CommonPlugin('inquiry'));

export default mongoose.model('Inquiry', Inquiry);
