
import moment from 'moment';
import mongoose from 'mongoose';
import _ from 'lodash';
import validator from 'validator';

import { i18n } from '../../helpers';
import CommonPlugin from './plugins/common';

const Position = new mongoose.Schema({
  slug: {
    type: String,
    required: true,
    index: true,
    unique: true
  },
  company_name: {
    type: String,
    required: true,
    validate: function (val, fn) {
      if (_.isString(val) && _.inRange(val.length, 3, 36))
        return fn();
      fn(false, i18n.translate('INVALID_COMPANY_NAME', this.locale));
    }
  },
  company_email: {
    type: String,
    required: true,
    validate: function (val, fn) {
      if (_.isString(val) && validator.isEmail(val))
        return fn();
      fn(false, i18n.translate('INVALID_COMPANY_EMAIL', this.locale));
    }
  },
  company_logo: {
    type: String,
    required: true,
    validate: function (val, fn) {
      if (_.isString(val) && validator.isURL(val))
        return fn();
      fn(false, i18n.translate('INVALID_COMPANY_LOGO', this.locale));
    }
  },
  company_website:{
    type: String,
    required: true,
    validate: function (val, fn) {
      if (_.isString(val) && validator.isURL(val))
        return fn();
      fn(false, i18n.translate('INVALID_COMPANY_WEBSITE', this.locale));
    }
  },
  job_title: {
    type: String,
    required: true,
    validate: function (val, fn) {
      if (_.isString(val) && _.inRange(val.length, 4, 41))
        return fn();
      fn(false, i18n.translate('INVALID_JOB_TITLE', this.locale));
    }
  },
  job_description: {
    type: String,
    required: true,
    validate: function (val, fn) {
      if (_.isString(val) && _.inRange(val.length, 100, 301))
        return fn();
      fn(false, i18n.translate('INVALID_JOB_DESCRIPTION', this.locale));
    }
  },
  status: {
    type: String,
    enum: [
      'Pending',
      'Approved',
      'Denied'
    ],
    default: 'Approved'
  },
  start_at: {
    type: Date,
    default: Date.now
  },
  end_at: {
    type: Date,
    default: () => moment().add(30, 'days').toDate()
  },
  ip: {
    type: String,
    required: true,
    index: true,
    validate: val => validator.isIP(val)
  },
  stripe_charge_id: String
});

Position.plugin(CommonPlugin('position'));

function validate(position, fn) {
  fn();
  // TODO: ensure the slug is unique based off `job_title`
  // we can use async validator for this
  // TODO: only allow certain html tags in `job_description`
}

Position.pre('validate', function (next) {
  validate(this, next);
});

Position.statics.validate = validate;

Position.index({
  company_name: 'text',
  job_title: 'text',
  job_description: 'text'
}, {
  name: 'Text index',
  weights: {
    company_name: 10,
    job_title: 5,
    job_description: 1
  }
});

export default mongoose.model('Position', Position);
