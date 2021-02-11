const path = require('path');

const Axe = require('axe');
const Boom = require('@hapi/boom');
const _ = require('lodash');
const base64ToS3 = require('nodemailer-base64-to-s3');
const consolidate = require('consolidate');
const manifestRev = require('manifest-rev');
const ms = require('ms');
const nodemailer = require('nodemailer');
const zxcvbn = require('zxcvbn');
const { boolean } = require('boolean');

const pkg = require('../package');
const env = require('./env');
const filters = require('./filters');
const i18n = require('./i18n');
const loggerConfig = require('./logger');
const meta = require('./meta');
const phrases = require('./phrases');
const utilities = require('./utilities');

const config = {
  // package.json
  pkg,

  // server
  env: env.NODE_ENV,
  urls: {
    web: env.WEB_URL,
    api: env.API_URL
  },

  // app
  supportRequestMaxLength: env.SUPPORT_REQUEST_MAX_LENGTH,
  email: {
    message: {
      from: env.EMAIL_DEFAULT_FROM
    },
    send: env.SEND_EMAIL,
    juiceResources: {
      preserveImportant: true,
      preserveFontFaces: false,
      preserveMediaQueries: false,
      preserveKeyFrames: false,
      removeStyleTags: true,
      insertPreservedExtraCss: false,
      extraCss: false,
      preservePseudos: false
    },
    lastLocaleField: 'last_locale',
    i18n: {
      ...i18n,
      autoReload: false,
      updateFiles: false,
      syncFiles: false
    }
  },
  logger: loggerConfig,
  appName: env.APP_NAME,
  appColor: env.APP_COLOR,
  twitter: env.TWITTER,
  i18n,

  // <https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#constructor-property>
  aws: {},

  // build directory
  buildBase: 'build',

  // templating
  views: {
    // root is required by `koa-views`
    root: path.join(__dirname, '..', 'app', 'views'),
    // These are options passed to `koa-views`
    // <https://github.com/queckezz/koa-views>
    // They are also used by the email job rendering
    options: {
      extension: 'pug',
      map: {},
      engineSource: consolidate
    },
    // A complete reference of options for Pug (default):
    // <https://pugjs.org/api/reference.html>
    locals: {
      // Even though pug deprecates this, we've added `pretty`
      // in `koa-views` package, so this option STILL works
      // <https://github.com/queckezz/koa-views/pull/111>
      pretty: env.NODE_ENV === 'development',
      cache: env.NODE_ENV !== 'development',
      // debug: env.NODE_ENV === 'development',
      // compileDebug: env.NODE_ENV === 'development',
      ...utilities,
      filters
    }
  },

  // user fields whose account updates create an action (e.g. email)
  accountUpdateFields: [
    'passport.fields.otpEnabled',
    'passport.fields.givenName',
    'passport.fields.familyName',
    'passportLocalMongoose.usernameField',
    'userFields.apiToken'
  ],

  // user fields (change these if you want camel case or whatever)
  userFields: {
    accountUpdates: 'account_updates',
    fullEmail: 'full_email',
    apiToken: 'api_token',
    otpRecoveryKeys: 'otp_recovery_keys',
    resetTokenExpiresAt: 'reset_token_expires_at',
    resetToken: 'reset_token',
    changeEmailTokenExpiresAt: 'change_email_token_expires_at',
    changeEmailToken: 'change_email_token',
    changeEmailNewAddress: 'change_email_new_address',
    hasSetPassword: 'has_set_password',
    hasVerifiedEmail: 'has_verified_email',
    pendingRecovery: 'pending_recovery',
    verificationPinExpiresAt: 'verification_pin_expires_at',
    verificationPinSentAt: 'verification_pin_sent_at',
    verificationPin: 'verification_pin',
    verificationPinHasExpired: 'verification_pin_has_expired',
    welcomeEmailSentAt: 'welcome_email_sent_at',
    twoFactorReminderSentAt: 'two_factor_reminder_sent_at'
  },

  // dynamic otp routes
  otpRoutePrefix: '/otp',
  otpRouteLoginPath: '/login',

  // dynamic otp routes
  loginOtpRoute: '/otp/login',

  // login route
  loginRoute: '/login',

  // verification
  verifyRoute: '/verify',
  verificationPinTimeoutMs: ms(env.VERIFICATION_PIN_TIMEOUT_MS),
  verificationPinEmailIntervalMs: ms(env.VERIFICATION_PIN_EMAIL_INTERVAL_MS),
  verificationPin: { length: 6, type: 'numeric' },

  // reset token
  resetTokenTimeoutMs: ms(env.RESET_TOKEN_TIMEOUT_MS),

  // change email token
  changeEmailTokenTimeoutMs: ms(env.CHANGE_EMAIL_TOKEN_TIMEOUT_MS),
  changeEmailLimitMs: ms(env.CHANGE_EMAIL_LIMIT_MS),

  // @ladjs/passport configuration (see defaults in package)
  // <https://github.com/ladjs/passport>
  passport: {
    fields: {
      // you may want to make this "full_name" instead
      displayName: 'display_name',
      // you could make this "first_name"
      givenName: 'given_name',
      // you could make this "last_name"
      familyName: 'family_name',
      avatarURL: 'avatar_url',
      googleProfileID: 'google_profile_id',
      googleAccessToken: 'google_access_token',
      googleRefreshToken: 'google_refresh_token',
      githubProfileID: 'github_profile_id',
      githubAccessToken: 'github_access_token',
      githubRefreshToken: 'github_refresh_token',
      otpToken: 'otp_token',
      otpEnabled: 'otp_enabled'
    },
    google: {
      accessType: 'offline',
      prompt: 'consent',
      scope: [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
      ]
    },
    github: {
      scope: ['user:email']
    }
  },

  // passport-local-mongoose options
  // <https://github.com/saintedlama/passport-local-mongoose>
  passportLocalMongoose: {
    usernameField: 'email',
    passwordField: 'password',
    attemptsField: 'login_attempts',
    lastLoginField: 'last_login_at',
    usernameLowerCase: true,
    limitAttempts: true,
    maxAttempts: env.NODE_ENV === 'development' ? Number.POSITIVE_INFINITY : 5,
    digestAlgorithm: 'sha256',
    encoding: 'hex',
    saltlen: 32,
    iterations: 25000,
    keylen: 512,
    passwordValidator: (password, fn) => {
      if (env.NODE_ENV === 'development') return fn();
      const { score } = zxcvbn(password);
      fn(score < 3 ? Boom.badRequest(phrases.INVALID_PASSWORD_STRENGTH) : null);
    },
    errorMessages: {
      MissingPasswordError: phrases.PASSPORT_MISSING_PASSWORD_ERROR,
      AttemptTooSoonError: phrases.PASSPORT_ATTEMPT_TOO_SOON_ERROR,
      TooManyAttemptsError: phrases.PASSPORT_TOO_MANY_ATTEMPTS_ERROR_,
      NoSaltValueStoredError: phrases.PASSPORT_NO_SALT_VALUE_STORED_ERROR,
      IncorrectPasswordError: phrases.PASSPORT_INCORRECT_PASSWORD_ERROR,
      IncorrectUsernameError: phrases.PASSPORT_INCORRECT_USERNAME_ERROR,
      MissingUsernameError: phrases.PASSPORT_MISSING_USERNAME_ERROR,
      UserExistsError: phrases.PASSPORT_USER_EXISTS_ERROR
    }
  },

  // passport callback options
  passportCallbackOptions: {
    successReturnToOrRedirect: '/my-account',
    failureRedirect: '/register',
    successFlash: true,
    failureFlash: true
  },

  // store IP address
  // <https://github.com/ladjs/store-ip-address>
  storeIPAddress: {
    ip: 'ip',
    lastIps: 'last_ips'
  },

  // field name for a user's last locale
  // (this gets re-used by email-templates and @ladjs/i18n; see below)
  lastLocaleField: 'last_locale'
};

// set dynamic login otp route
config.loginOtpRoute = `${config.otpRoutePrefix}${config.otpRouteLoginPath}`;

// set build dir based off build base dir name
config.buildDir = path.join(__dirname, '..', config.buildBase);

// meta support for SEO
config.meta = meta(config);

// add i18n api to views
const logger = new Axe(config.logger);

// add manifest helper for rev-manifest.json support
config.manifest = path.join(config.buildDir, 'rev-manifest.json');
config.srimanifest = path.join(config.buildDir, 'sri-manifest.json');
config.views.locals.manifest = manifestRev({
  prepend: '/',
  manifest: config.srimanifest
});

// add global `config` object to be used by views
config.views.locals.config = _.pick(config, [
  'appColor',
  'appName',
  'env',
  'lastLocaleField',
  'loginRoute',
  'maxForwardedAddresses',
  'otpRoutePrefix',
  'passport',
  'passportCallbackOptions',
  'passportLocalMongoose',
  'pkg',
  'recordPrefix',
  'storeIPAddress',
  'supportRequestMaxLength',
  'twitter',
  'urls',
  'userFields',
  'verificationPin',
  'verifyRoute'
]);

// add `views` to `config.email`
config.email.transport = nodemailer.createTransport({
  // you can use any transport here
  // but we use postmarkapp.com by default
  // <https://nodemailer.com/transports/>
  service: 'postmark',
  auth: {
    user: env.POSTMARK_API_TOKEN,
    pass: env.POSTMARK_API_TOKEN
  },
  logger,
  debug: boolean(env.TRANSPORT_DEBUG)
});

config.email.views = { ...config.views };
config.email.views.root = path.join(__dirname, '..', 'emails');
config.email.juiceResources.webResources = {
  relativeTo: config.buildDir,
  images: true
};

config.email.transport.use(
  'compile',
  base64ToS3({
    aws: _.merge({}, config.aws, {
      params: {
        Bucket: env.AWS_S3_BUCKET
      }
    }),
    cloudFrontDomainName: env.AWS_CLOUDFRONT_DOMAIN,
    fallbackDir: path.join(config.buildDir, 'img', 'nodemailer'),
    fallbackPrefix: `${config.urls.web}/img/nodemailer/`,
    logger
  })
);

if (
  !config.email.juiceResources.webResources.images ||
  env.NODE_ENV !== 'production'
)
  config.email.views.locals.manifest = manifestRev({
    prepend: `${config.urls.web}/`,
    manifest: config.manifest
  });

module.exports = config;
