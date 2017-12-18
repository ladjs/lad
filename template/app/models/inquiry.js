const mongoose = require('mongoose');
const validator = require('validator');
const _ = require('lodash');
const mongooseCommonPlugin = require('mongoose-common-plugin');

const config = require('../../config');

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
    validate: val => _.isString(val) && val.length <= config.supportRequestMaxLength
  },
  is_email_only: {
    type: Boolean,
    default: false
  }
});

Inquiry.plugin(mongooseCommonPlugin, { object: 'inquiry' });

module.exports = mongoose.model('Inquiry', Inquiry);
