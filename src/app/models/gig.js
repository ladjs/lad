
import moment from 'moment';
import mongoose from 'mongoose';
import _ from 'lodash';
import validator from 'validator';

import { i18n } from '../../helpers';
import { SlugPlugin, CommonPlugin } from './plugins';

const Gig = new mongoose.Schema({
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
  gig_title: {
    type: String,
    required: true,
    validate: function (val, fn) {
      if (_.isString(val) && _.inRange(val.length, 4, 41))
        return fn();
      fn(false, i18n.translate('INVALID_GIG_TITLE', this.locale));
    }
  },
  gig_description: {
    type: String,
    required: true,
    // TODO: only allow certain html tags in `gig_description`
    validate: function (val, fn) {
      if (_.isString(val) && _.inRange(val.length, 100, 301))
        return fn();
      fn(false, i18n.translate('INVALID_GIG_DESCRIPTION', this.locale));
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

Gig.plugin(SlugPlugin);
Gig.plugin(CommonPlugin('gig'));

Gig.index({
  company_name: 'text',
  gig_title: 'text',
  gig_description: 'text'
}, {
  name: 'Text index',
  weights: {
    company_name: 10,
    gig_title: 5,
    gig_description: 1
  }
});

export default mongoose.model('Gig', Gig);
