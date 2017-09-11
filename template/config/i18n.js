// turn off max length eslint rule since this is a config file with long strs
/* eslint max-len: 0 */

// TODO: ensure no strings here are unused

// load the defaults and environment specific configuration
const dotenvExtended = require('dotenv-extended');
const dotenvMustache = require('dotenv-mustache');
const dotenvParseVariables = require('dotenv-parse-variables');

let env = dotenvExtended.load({
  silent: false,
  errorOnMissing: true,
  errorOnExtra: true
});
env = dotenvMustache(env);
env = dotenvParseVariables(env);

module.exports = {
  INVALID_API_TOKEN: 'Invalid token',
  INVALID_API_CREDENTIALS: 'Invalid creds',
  IS_NOT_ADMIN: 'You do not belong to the administrative user group',
  GOOD_MORNING: 'Good morning',
  GOOD_AFTERNOON: 'Good afternoon',
  GOOD_EVENING: 'Good evening',
  INVALID_EMAIL: 'Email address was invalid.',
  INVALID_PASSWORD: 'Password was invalid.',
  INVALID_RESET_TOKEN: 'Reset token provided was invalid.',
  INVALID_RESET_PASSWORD: 'Reset token and email were not valid together.',
  INVALID_PASSWORD_STRENGTH: 'Password strength was not strong enough.',
  INVALID_SESSION_SECRET: 'Invalid session secret.',
  INVALID_TOKEN: 'Invalid CSRF token.',
  INVALID_MESSAGE: `Your message was invalid, as it was either blank or more than (${env.CONTACT_REQUEST_MAX_LENGTH}) characters.`,
  INVALID_FILE: 'File upload was invalid.',
  PASSWORD_RESET_SENT:
    'We have sent you an email with a link to reset your password.',
  PASSWORD_RESET_LIMIT:
    'You can only request a password reset every 30 minutes.  Please try again %s.',
  HELLO_WORLD: 'Hello %s world.',
  REGISTERED: 'You have successfully registered',
  RESET_PASSWORD: 'You have successfully reset your password.',
  CONTACT_REQUEST_MESSAGE:
    'Thank you for contacting us.  We would love to hear more from you.  How can we help?',
  CONTACT_REQUEST_SENT:
    'Your contact request has been sent successfully.  You should hear from us soon.  Thank you!',
  CONTACT_REQUEST_ERROR:
    'We were unable to send your contact request.  We have been alerted of this problem.  Please try again.',
  CONTACT_REQUEST_LIMIT:
    'You have reached the limit for sending contact requests.  Please try again.',
  REQUEST_TIMED_OUT:
    'Sorry, your request has timed out.  We have been alerted of this issue.  Please try again.',
  LOGGED_IN: 'You have successfully signed in.',
  SIGNED_OUT: 'You have successfully signed out.',
  UNKNOWN_ERROR:
    'An unknown error has occurred. We have been alerted of this issue. Please try again.',
  LOGIN_REQUIRED: 'Please log in to view the page you requested.',
  INVALID_STRIPE_TOKEN:
    'An issue occurred while communicating with our payment provider. Please try again.',
  INVALID_SLUG: 'Please slightly change values to ensure slug uniqueness.'
};
