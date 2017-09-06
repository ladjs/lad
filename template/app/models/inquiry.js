const mongoose = require('mongoose');
const validator = require('validator');
const _ = require('lodash');

const config = require('../../config');
const CommonPlugin = require('./plugins/common');

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
    validate: val =>
      _.isString(val) && val.length <= config.contactRequestMaxLength
  },
  is_email_only: {
    type: Boolean,
    default: false
  }
});

Inquiry.plugin(new CommonPlugin('inquiry'));

module.exports = mongoose.model('Inquiry', Inquiry);
