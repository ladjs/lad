const mongoose = require('mongoose');
const validator = require('validator');
const _ = require('lodash');
const mongooseCommonPlugin = require('mongoose-common-plugin');

// <https://github.com/Automattic/mongoose/issues/5534>
mongoose.Error.messages = require('@ladjs/mongoose-error-messages');

const config = require('../../config');

const Inquiry = new mongoose.Schema({
  ip: {
    type: String,
    required: true,
    index: true,
    validate: (value) => validator.isIP(value)
  },
  email: {
    type: String,
    required: true,
    index: true,
    validate: (value) => validator.isEmail(value)
  },
  message: {
    type: String,
    required: true,
    validate: (value) =>
      _.isString(value) && value.length <= config.supportRequestMaxLength
  },
  is_email_only: {
    type: Boolean,
    default: false
  }
});

Inquiry.plugin(mongooseCommonPlugin, { object: 'inquiry' });

module.exports = mongoose.model('Inquiry', Inquiry);
