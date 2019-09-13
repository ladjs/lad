const Cabin = require('cabin');
const _ = require('lodash');

// setup our Cabin instance
const cabin = new Cabin({
  key: window.API_TOKEN || null,
  axe: {
    endpoint: `${window.API_URL}/v1/log`,
    showMeta: true,
    showStack: true,
    capture: true,
    silent: process.env.NODE_ENV === 'production'
  }
});

// set the user if we're logged in
if (_.isObject(window.USER)) cabin.setUser(window.USER);

module.exports = cabin;
