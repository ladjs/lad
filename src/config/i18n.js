
// turn off max length eslint rule since this is a config file with long strs
/* eslint max-len: 0*/

// load the defaults and environment specific configuration
import dotenvExtended from 'dotenv-extended';
import dotenvMustache from 'dotenv-mustache';
import dotenvParseVariables from 'dotenv-parse-variables';

let env = dotenvExtended.load({
  silent: false,
  errorOnMissing: true,
  errorOnExtra: true
});
env = dotenvMustache(env);
env = dotenvParseVariables(env);

export default {
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
  PASSWORD_RESET_SENT: 'We have sent you an email with a link to reset your password.',
  PASSWORD_RESET_LIMIT: 'You can only request a password reset every 30 minutes.  Please try again %s.',
  HELLO_WORLD: 'Hello %s world.',
  REGISTERED: 'You have successfully registered',
  RESET_PASSWORD: 'You have successfully reset your password.',
  CONTACT_REQUEST_MESSAGE: 'Thank you for contacting us.  We would love to hear more from you.  How can we help?',
  CONTACT_REQUEST_SENT: 'Your contact request has been sent successfully.  You should hear from us soon.  Thank you!',
  CONTACT_REQUEST_ERROR: 'We were unable to send your contact request.  We have been alerted of this problem.  Please try again later.',
  CONTACT_REQUEST_LIMIT: 'You have reached the limit for sending contact requests.  Please try again later.',
  REQUEST_TIMED_OUT: 'Sorry, your request has timed out.  We have been alerted of this issue.  Please try again.',
  LOGGED_IN: 'You have successfully signed in.',
  SIGNED_OUT: 'You have successfully signed out.',
  UNKNOWN_ERROR: 'An unknown error has occurred. We have been alerted of this issue. Please try again.',
  INVALID_LICENSE_KEY: 'Your license key was invalid or missing.'
};
