const path = require('path');

const queues = [
  {
    name: 'email',
    options: {
      attempts: 5
    },
    processors: [
      {
        processor: path.join(__dirname, 'email.js')
      }
    ]
  }
];

if (process.env.GOOGLE_TRANSLATE_KEY)
  queues.push({
    name: 'mandarin',
    options: {
      attempts: 1
    },
    processors: [
      {
        processor: path.join(__dirname, 'mandarin.js'),
        concurrency: 1
      }
    ]
  });

module.exports = queues;
