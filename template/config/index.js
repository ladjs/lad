const path = require('path');

const Axe = require('axe');
const Boom = require('@hapi/boom');
const I18N = require('@ladjs/i18n');
const _ = require('lodash');
const base64ToS3 = require('nodemailer-base64-to-s3');
const boolean = require('boolean');
const consolidate = require('consolidate');
const nodemailer = require('nodemailer');
const pino = require('pino');
const manifestRev = require('manifest-rev');
const strength = require('strength');
const { Signale } = require('signale');

const pkg = require('../package');
const env = require('./env');
const meta = require('./meta');
const phrases = require('./phrases');
const polyfills = require('./polyfills');
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
    }
  },
  logger: {
    showStack: env.SHOW_STACK,
    name: env.APP_NAME,
    logger:
      env === 'production'
        ? pino({
            customLevels: {
              log: 30
            }
          })
        : new Signale()
  },
  livereload: {
    port: env.LIVERELOAD_PORT
  },
  appName: env.APP_NAME,
  appColor: env.APP_COLOR,
  twitter: env.TWITTER,
  i18n: {
    // see @ladjs/i18n for a list of defaults
    // <https://github.com/ladjs/i18n>
    // but for complete configuration reference please see:
    // <https://github.com/mashpie/i18n-node#list-of-all-configuration-options>
    phrases,
    directory: path.join(__dirname, '..', 'locales')
  },

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
      pretty: true,
      cache: env.NODE_ENV !== 'development',
      // debug: env.NODE_ENV === 'development',
      // compileDebug: env.NODE_ENV === 'development',
      ...utilities,
      polyfills,
      filters: {}
    }
  },

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
      googleRefreshToken: 'google_refresh_token'
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
    maxAttempts: env.NODE_ENV === 'development' ? Infinity : 5,
    digestAlgorithm: 'sha256',
    encoding: 'hex',
    saltlen: 32,
    iterations: 25000,
    keylen: 512,
    passwordValidator: (password, fn) => {
      if (env.NODE_ENV === 'development') return fn();
      const howStrong = strength(password);
      fn(
        howStrong < 3
          ? Boom.badRequest(phrases.INVALID_PASSWORD_STRENGTH)
          : null
      );
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
    successReturnToOrRedirect: '/dashboard',
    failureRedirect: '/login',
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

// set build dir based off build base dir name
config.buildDir = path.join(__dirname, '..', config.buildBase);

// add lastLocale configuration path name to both email-templates and i18n
config.i18n.lastLocaleField = config.lastLocaleField;
config.email.lastLocaleField = config.lastLocaleField;

// meta support for SEO
config.meta = meta(config);

// add i18n filter to views `:translate(locale)`
const logger = new Axe(config.logger);
const i18n = new I18N({
  ...config.i18n,
  logger
});

// add manifest helper for rev-manifest.json support
config.manifest = path.join(config.buildDir, 'rev-manifest.json');
config.views.locals.manifest = manifestRev({
  prepend:
    env.AWS_CLOUDFRONT_DOMAIN && env.NODE_ENV === 'production'
      ? `//${env.AWS_CLOUDFRONT_DOMAIN}/`
      : '/',
  manifest: config.manifest
});

// add pug filter for easy translation of nested blocks
config.views.locals.filters.translate = function(...args) {
  return i18n.api.t(...args);
};

// add global `config` object to be used by views
config.views.locals.config = config;

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
config.email.i18n = config.i18n;
config.email.juiceResources.webResources = {
  relativeTo: config.buildDir,
  images: true
};

config.email.transport.use(
  'compile',
  base64ToS3({
    aws: _.merge(config.aws, {
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
