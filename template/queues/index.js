const path = require('path');

const queues = [
  {
    name: 'email',
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
    processors: [
      {
        processor: path.join(__dirname, 'mandarin.js')
      }
    ]
  });

module.exports = queues;
