
import mongoose from 'mongoose';

import config from '../../config';

const Job = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    index: true
  },
  data: {},
  type: {
    type: String,
    default: 'normal',
    enum: [ 'normal', 'single' ]
  },
  priority: {
    type: Number,
    default: 0,
    min: -20,
    max: 20,
    index: 1
  },
  nextRunAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  lastModifiedBy: {
    type: String,
    default: config.agenda.name
  },
  lockedAt: {
    type: Date,
    index: true
  },
  lastFinishedAt: Date
});

export default mongoose.model('Job', Job);
