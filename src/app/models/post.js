
import mongoose from 'mongoose';
import _ from 'lodash';
import validator from 'validator';

import CommonPlugin from './plugins/common';

const Post = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    required: true,
    index: true
  },
  slug: {
    type: String,
    required: true,
    index: true,
    unique: true
  },
  category: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    validate: val => _.isString(val) && val.length <= 59
  },
  content: {
    type: String,
    required: true
  },
  excerpt: {
    type: String,
    required: true,
    validate: val => _.isString(val) && val.length <= 100
  },
  status: {
    type: String,
    enum: [
      'Draft',
      'Pending',
      'Published',
      'Trash'
    ],
    default: 'Draft'
  },
  post_at: {
    type: Date,
    default: Date.now
  },
  ip: {
    type: String,
    required: true,
    index: true,
    validate: val => validator.isIP(val)
  }
});

Post.plugin(CommonPlugin('post'));

Post.index({
  title: 'text',
  content: 'text',
  excerpt: 'text'
}, {
  name: 'Text index',
  weights: {
    title: 10,
    content: 5,
    excerpt: 1
  }
});

export default mongoose.model('Post', Post);
