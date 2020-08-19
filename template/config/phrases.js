const env = require('./env');

// turn off max length eslint rule since this is a config file with long strs
/* eslint max-len: 0 */

module.exports = {
  HELLO: 'Hello',
  WWW_WARNING:
    'It looks like you accidentally included "www." in your domain name.  Did you mean example.com instead of www.example.com?',
  INVALID_API_CREDENTIALS: 'Invalid API credentials.',
  INVALID_API_TOKEN: 'Invalid API token.',
  INVALID_EMAIL: 'Email address was invalid.',
  INVALID_FILE: 'File upload was invalid.',
  INVALID_MESSAGE: `Your message was invalid, as it was either blank or more than (${env.SUPPORT_REQUEST_MAX_LENGTH}) characters.`,
  INVALID_PASSWORD: 'Password was invalid.',
  INVALID_PASSWORD_CONFIRM: 'Password confirmation did not match new password.',
  INVALID_PASSWORD_STRENGTH: 'Password strength was not strong enough.',
  INVALID_PORT: 'Invalid port number.',
  INVALID_PROVIDER: 'We do not support this authentication provider.',
  INVALID_RECOVERY_KEY: 'Invalid recovery key.',
  INVALID_RESET_PASSWORD: 'Reset token and email were not valid together.',
  INVALID_RESET_TOKEN: 'Reset token provided was invalid.',
  INVALID_SET_EMAIL: 'Change email token and email were not valid together.',
  INVALID_SESSION_SECRET: 'Invalid session secret.',
  INVALID_SLUG: 'Please slightly change values to ensure slug uniqueness.',
  INVALID_STRING: '%s was missing or blank.',
  INVALID_USER: 'User does not exist.',
  INVALID_TOKEN: 'Invalid CSRF token.',
  INVALID_VERIFICATION_PIN: 'The verification code entered was invalid.',
  EMAIL_VERIFICATION_REQUIRED: 'Please verify your email address to continue.',
  EMAIL_VERIFICATION_INTERVAL:
    'Please wait for <span class="notranslate">%s</span> and try again.',
  EMAIL_VERIFICATION_SUCCESS:
    'Your email address has been successfully verified.',
  EMAIL_ALREADY_VERIFIED: 'Your email address is already verified.',
  EMAIL_VERIFICATION_SENT:
    'A verification code has been sent to your email address.',
  EMAIL_VERIFICATION_EXPIRED:
    'Your current email verification code has expired and we have sent a new one to your email address.',
  INVALID_OTP_PASSCODE: 'Invalid two-factor authentication passcode.',
  IS_NOT_ADMIN: 'You do not belong to the administrative user group.',
  TWO_FACTOR_REQUIRED:
    'Please log in with two-factor authentication to continue.',
  LOGIN_REQUIRED: 'Please log in or sign up to view the page you requested.',
  LOGOUT_REQUIRED: 'Please log out to view the page you requested.',
  PASSWORD_RESET_LIMIT:
    'You can only request a password reset every 30 minutes.  Please try again %s.',
  PASSWORD_RESET_SENT:
    'We have sent you an email with a link to reset your password.',
  EMPTY_RECOVERY_KEYS: 'Empty Recovery Keys',
  OTP_RECOVERY_RESET:
    'You have run out of recovery keys. Please download the newly generated recovery keys before continuing.',
  OTP_RECOVERY_SUCCESS:
    'Recovery passcode successful. This passcode will no longer be valid.',
  REGISTERED: 'You have successfully registered.',
  REQUEST_OK: 'Your request was successfully completed.',
  REQUEST_TIMED_OUT:
    'Sorry, your request has timed out.  We have been alerted of this issue.  Please try again.',
  RESET_PASSWORD: 'You have successfully reset your password.',
  CHANGE_EMAIL: 'You have successfully set a new email address.',
  SIGNED_OUT: 'You have successfully signed out.',
  PENDING_RECOVERY_VERIFICATION_SUCCESS:
    'Your email has been successfully verified. You should receive a support email from an admin within the next 3-5 business days.',
  SUPPORT_REQUEST_ERROR:
    'We were unable to send your support request.  We have been alerted of this problem.  Please try again.',
  SUPPORT_REQUEST_LIMIT:
    'You have reached the limit for sending support requests.  Please try again.',
  SUPPORT_REQUEST_MESSAGE:
    'Thank you for contacting us.  We would love to hear more from you.  How can we help?',
  SUPPORT_REQUEST_SENT:
    'Your support request has been sent successfully.  You should hear from us soon.  Thank you!',
  UNKNOWN_ERROR:
    'An unknown error has occurred. We have been alerted of this issue. Please try again.',
  PASSPORT_MISSING_PASSWORD_ERROR: 'Please enter a password.',
  PASSPORT_ATTEMPT_TOO_SOON_ERROR:
    'Account is currently locked due to rate limiting.  Please try again later.',
  PASSPORT_TOO_MANY_ATTEMPTS_ERROR:
    'Account is currently locked due to too many failed login attempts.  Please try again later.',
  PASSPORT_NO_SALT_VALUE_STORED_ERROR:
    'Authentication is not possible.  No salt value was stored for the account.',
  PASSPORT_INCORRECT_PASSWORD_ERROR: 'Email address or password is incorrect.',
  PASSPORT_INCORRECT_USERNAME_ERROR: 'Email address or password is incorrect.',
  PASSPORT_MISSING_USERNAME_ERROR: 'Please enter an email address.',
  PASSPORT_USER_EXISTS_ERROR:
    'A user with the given email address is already registered.  Please try to log in or reset the password if this account belongs to you.',
  EMAIL_FAILED_TO_SEND:
    'Unfortunately an error occurred while sending the email.  Please try again or <a href="/help">contact us</a> for help.',
  EMAIL_CHANGE_SENT:
    'Check your inbox for a link to confirm your email change.',
  EMAIL_CHANGE_LIMIT:
    'You can only change your email address every <span class="notranslate">%s</span> minutes. Please try again <span class="notranslate">%s</span>.',
  EMAIL_CHANGE_ALREADY_EXISTS:
    'The email address <span class="notranslate">%s</span> already exists.'
};
