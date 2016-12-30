
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
  SLOGAN: 'Chew apart your projects with speed.',
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
  INVALID_COMPANY_NAME: 'Company name must be 3-35 characters.',
  INVALID_COMPANY_WEBSITE: 'Company website must be a URL (e.g. <code>http://domain.com</code>).',
  INVALID_GIG_TITLE: 'Gig title must be 4-40 characters.',
  INVALID_GIG_DESCRIPTION: 'Gig description must be 100-300 characters.',
  PASSWORD_RESET_SENT: 'We have sent you an email with a link to reset your password.',
  PASSWORD_RESET_LIMIT: 'You can only request a password reset every 30 minutes.  Please try again %s.',
  HELLO_WORLD: 'Hello %s world.',
  REGISTERED: 'You have successfully registered',
  RESET_PASSWORD: 'You have successfully reset your password.',
  CONTACT_REQUEST_MESSAGE: 'Thank you for contacting us.  We would love to hear more from you.  How can we help?',
  CONTACT_REQUEST_SENT: 'Your contact request has been sent successfully.  You should hear from us soon.  Thank you!',
  CONTACT_REQUEST_ERROR: 'We were unable to send your contact request.  We have been alerted of this problem.  Please try again.',
  CONTACT_REQUEST_LIMIT: 'You have reached the limit for sending contact requests.  Please try again.',
  REQUEST_TIMED_OUT: 'Sorry, your request has timed out.  We have been alerted of this issue.  Please try again.',
  LOGGED_IN: 'You have successfully signed in.',
  SIGNED_OUT: 'You have successfully signed out.',
  UNKNOWN_ERROR: 'An unknown error has occurred. We have been alerted of this issue. Please try again.',
  INVALID_LICENSE_KEY: 'Your license key was invalid or missing.',
  LOGIN_REQUIRED: 'Please log in to view the page you requested.',
  GIG_POST_LIMIT: 'You have reached the limit for posting gigs. Please try again.',
  INVALID_COMPANY_LOGO: 'Company logo file type must be a PNG, JPG, or GIF.',
  LICENSE_REQUIRED: 'Purchase a CrocodileJS license to view this page.',
  INVALID_STRIPE_TOKEN: 'An issue occurred while communicating with our payment provider. Please try again.',
  INVALID_NUM_LICENSES: 'The number of licenses to purchase must be at least 1.',
  INVALID_START_AT_DATE: 'The date specified must be formatted as MM/DD/YY and must be either today or sometime in the future.',
  PURCHASE_LICENSE_SENT: 'Your license key(s) have been emailed to you.  You can also view your license key(s) at the <a href="/my-account">My Account</a> page.',
  INVALID_SLUG: 'Please slightly change values to ensure slug uniqueness.',
  INVALID_GIG: 'No gig was found',
  GIG_CREATED: 'Gig was successfully created'
};
