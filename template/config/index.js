const path = require('path');
const consolidate = require('consolidate');
const _ = require('lodash');
const Logger = require('@ladjs/logger');
const nodemailer = require('nodemailer');
const I18N = require('@ladjs/i18n');
const base64ToS3 = require('nodemailer-base64-to-s3');
const strength = require('strength');
const boolean = require('boolean');

const pkg = require('../package');
const env = require('./env');
const environments = require('./environments');
const utilities = require('./utilities');
const phrases = require('./phrases');
const meta = require('./meta');

const bitter = path.join(__dirname, '..', 'node_modules', 'bitter-font', 'fonts');

const config = {
  fonts: {
    bitter: {
      bold: path.join(bitter, 'Bold', 'Bitter-Bold.ttf'),
      boldItalic: path.join(bitter, 'BoldItalic', 'Bitter-BoldItalic.ttf'),
      italic: path.join(bitter, 'Italic', 'Bitter-Italic.ttf'),
      regular: path.join(bitter, 'Regular', 'Bitter-Regular.ttf')
    }
  },

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
      preserveImportant: true
    }
  },
  logger: {
    showStack: env.SHOW_STACK,
    appName: env.APP_NAME
  },
  livereload: {
    port: env.LIVERELOAD_PORT
  },
  ga: env.GOOGLE_ANALYTICS,
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

  // lad's agenda configuration
  // <https://github.com/ladjs/agenda>
  agendaRecurringJobs: [],
  agendaBootJobs: ['mandarin'],

  aws: {
    key: env.AWS_IAM_KEY,
    accessKeyId: env.AWS_IAM_KEY,
    secret: env.AWS_IAM_SECRET,
    secretAccessKey: env.AWS_IAM_SECRET,
    distributionId: env.AWS_CF_DI,
    domainName: env.AWS_CF_DOMAIN,
    params: {
      Bucket: env.AWS_S3_BUCKET
    }
  },

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
      filters: {}
    }
  },

  // @ladjs/passport configuration (see defaults in package)
  // <https://github.com/ladjs/passport>
  passport: {},

  // passport-local-mongoose options
  // <https://github.com/saintedlama/passport-local-mongoose>
  passportLocalMongoose: {
    usernameField: 'email',
    passwordField: 'password',
    attemptsField: 'login_attempts',
    lastLoginField: 'last_login_at',
    usernameLowerCase: true,
    limitAttempts: true,
    maxAttempts: process.env.NODE_ENV === 'development' ? Number.MAX_VALUE : 5,
    digestAlgorithm: 'sha256',
    encoding: 'hex',
    saltlen: 32,
    iterations: 25000,
    keylen: 512,
    passwordValidator: (password, fn) => {
      if (process.env.NODE_ENV === 'development') return fn();
      const howStrong = strength(password);
      fn(howStrong < 3 ? new Error('Password not strong enough') : null);
    }
  },

  // passport callback options
  passportCallbackOptions: {
    successReturnToOrRedirect: '/dashboard',
    failureRedirect: '/login',
    successFlash: true,
    failureFlash: true
  },

  // stripe
  stripe: {
    secretKey: env.STRIPE_SECRET_KEY,
    publishableKey: env.STRIPE_PUBLISHABLE_KEY
  }
};

// merge environment configurations
if (_.isObject(environments[env.NODE_ENV])) _.merge(config, environments[env.NODE_ENV]);

// meta support for SEO
config.meta = meta(config);

// add i18n filter to views `:translate(locale)`
const logger = new Logger(config.logger);
const i18n = new I18N({
  ...config.i18n,
  logger
});
config.views.locals.filters.translate = function() {
  return i18n.api.t(...arguments);
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
  debug: boolean(process.env.TRANSPORT_DEBUG)
});
config.email.transport.use(
  'compile',
  base64ToS3({
    cloudFrontDomainName: env.AWS_CF_DOMAIN,
    aws: config.aws
  })
);

config.email.views = Object.assign({}, config.views);
config.email.views.root = path.join(__dirname, '..', 'emails');
config.email.i18n = config.i18n;
config.email.juiceResources.webResources = { relativeTo: config.buildDir };

module.exports = config;
