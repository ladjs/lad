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
  }
];

module.exports = queues;
