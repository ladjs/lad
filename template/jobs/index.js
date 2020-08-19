const { boolean } = require('boolean');

const jobs = [
  {
    name: 'welcome-email',
    interval: '1m'
  },
  {
    name: 'account-updates',
    interval: '1m'
  }
  // TODO: currently commented out until we have better translation solution
  // {
  //   name: 'translate-phrases',
  //   interval: '1h'
  // }
  // {
  //   name: 'translate-markdown',
  //   interval: '30m'
  // },
];

if (boolean(process.env.AUTH_OTP_ENABLED))
  jobs.push({
    name: 'two-factor-reminder',
    interval: '3h'
  });

module.exports = jobs;
