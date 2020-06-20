const path = require('path');

const ms = require('ms');

const queues = [
  {
    name: 'email',
    options: {
      attempts: 2
    },
    processors: [
      {
        processor: path.join(__dirname, 'email.js'),
        concurrency: 3
      }
    ]
  },
  {
    name: 'welcome-email',
    options: {
      attempts: 1,
      defaultJobOptions: {
        repeat: {
          every: ms('1m')
        }
      }
    },
    processors: [
      {
        processor: path.join(__dirname, 'welcome-email.js'),
        concurrency: 1
      }
    ]
  },
  {
    name: 'translate-phrases',
    options: {
      attempts: 1,
      defaultJobOptions: {
        repeat: {
          every: process.env.NODE_ENV === 'production' ? ms('15s') : ms('15m')
        }
      }
    },
    processors: [
      {
        processor: path.join(__dirname, 'translate-phrases.js'),
        concurrency: 1
      }
    ]
  },
  {
    name: 'translate-markdown',
    options: {
      attempts: 1,
      defaultJobOptions: {
        repeat: {
          every: process.env.NODE_ENV === 'production' ? ms('30s') : ms('30m')
        }
      }
    },
    processors: [
      {
        processor: path.join(__dirname, 'translate-markdown.js'),
        concurrency: 1
      }
    ]
  }
];

module.exports = queues;
