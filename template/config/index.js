const os = require('os');
const path = require('path');
const strength = require('strength');
const consolidate = require('consolidate');
const _ = require('lodash');
const dotenvExtended = require('dotenv-extended');
const dotenvMustache = require('dotenv-mustache');
const dotenvParseVariables = require('dotenv-parse-variables');

const pkg = require('../../package');
const environments = require('./environments');
const locales = require('./locales');
const utilities = require('./utilities');
const i18n = require('./i18n');
const meta = require('./meta');

let env = dotenvExtended.load({
  silent: false,
  errorOnMissing: true,
  errorOnExtra: true
});
env = dotenvMustache(env);
env = dotenvParseVariables(env);

const omitCommonFields = ['_id', '__v'];

const viewsDir = path.join(__dirname, '..', 'app', 'views');

const config = {
  emailFontPath: path.join(
    __dirname,
    '..',
    'assets',
    'fonts',
    'GoudyBookletter1911.otf'
  ),

  // if we should send email or not
  sendEmail: env.SEND_EMAIL,

  // default language/locale
  defaultLocale: 'en',

  // package.json
  pkg,

  // server
  protocols: {
    web: env.WEB_PROTOCOL,
    api: env.API_PROTOCOL
  },
  ports: {
    web: env.WEB_PORT,
    api: env.API_PORT
  },
  hosts: {
    web: env.WEB_HOST,
    api: env.API_HOST
  },
  env: env.NODE_ENV,
  urls: {
    web: env.WEB_URL,
    api: env.API_URL
  },
  ssl: {
    web: {},
    api: {}
  },

  // app
  googleTranslateKey: env.GOOGLE_TRANSLATE_KEY,
  webRequestTimeoutMs: env.WEB_REQUEST_TIMEOUT_MS,
  apiRequestTimeoutMs: env.API_REQUEST_TIMEOUT_MS,
  contactRequestMaxLength: env.CONTACT_REQUEST_MAX_LENGTH,
  cookiesKey: env.COOKIES_KEY,
  email: {
    from: env.EMAIL_DEFAULT_FROM,
    attachments: [],
    headers: {}
  },
  livereload: {
    port: env.LIVERELOAD_PORT
  },
  logger: {
    showStack: env.SHOW_STACK
  },
  ga: env.GOOGLE_ANALYTICS,
  sessionKeys: env.SESSION_KEYS,
  cors: {
    // <https://github.com/koajs/cors#corsoptions>
    maxAge: (env.MAX_AGE / 1000) % 60
  },
  rateLimit: {
    duration: 60000,
    max: env.NODE_ENV === 'production' ? 100 : 1000,
    id: ctx => ctx.ip
  },
  koaManifestRev: {
    manifest: path.join(__dirname, '..', '..', 'build', 'rev-manifest.json'),
    prepend: `//${env.AWS_CF_DOMAIN}/`
  },
  appFavicon: path.join(__dirname, '..', 'assets', 'img', 'favicon.ico'),
  appName: env.APP_NAME,
  i18nUpdateFiles: env.I18N_UPDATE_FILES,
  i18nAutoReload: env.I18N_AUTO_RELOAD,
  i18nSyncFiles: env.I18N_SYNC_FILES,
  serveStatic: {
    // <https://github.com/niftylettuce/koa-better-static#options>
  },

  // postmarkapp.com
  postmark: {
    service: 'postmark',
    auth: {
      user: env.POSTMARK_API_TOKEN,
      pass: env.POSTMARK_API_TOKEN
    }
  },

  // mongoose
  mongoose: {
    debug: env.MONGOOSE_DEBUG,
    Promise: global.Promise,
    mongo: {
      url: env.DATABASE_URL
    }
  },

  // mongoose security helpers
  // (these fields get omitted when responses sent)
  omitCommonFields,
  omitUserFields: [
    ...omitCommonFields,
    'ip',
    'last_ips',
    'email',
    'api_token',
    'group',
    'attempts',
    'last',
    'hash',
    'salt',
    'reset_token_expires_at',
    'reset_token',
    'google_profile_id',
    'google_access_token',
    'google_refresh_token'
  ],

  // localization
  localesDirectory: path.join(__dirname, '..', 'locales'),

  // agenda
  agenda: {
    name: `${os.hostname()}_${process.pid}`,
    maxConcurrency: env.AGENDA_MAX_CONCURRENCY
  },
  agendaCollectionName: env.AGENDA_COLLECTION_NAME,
  // these get automatically invoked to `agenda.every`
  // e.g. `agenda.every('5 minutes', 'locales')`
  // and you define them as [ interval, job name ]
  // you need to define them here for graceful handling
  agendaRecurringJobs: [],

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

  // redis
  redis: env.REDIS_URL,

  // templating
  buildDir: path.join(__dirname, '..', 'build'),
  views: {
    // root is required by `koa-views`
    root: viewsDir,
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
      pretty: true,
      cache: env.NODE_ENV !== 'development',
      // debug: env.NODE_ENV === 'development',
      // compileDebug: env.NODE_ENV === 'development',
      ...utilities
    }
  },

  // csrf
  csrf: {},

  // authentication
  auth: {
    local: env.AUTH_LOCAL_ENABLED,
    providers: {
      facebook: env.AUTH_FACEBOOK_ENABLED,
      twitter: env.AUTH_TWITTER_ENABLED,
      google: env.AUTH_GOOGLE_ENABLED,
      github: env.AUTH_GITHUB_ENABLED,
      linkedin: env.AUTH_LINKEDIN_ENABLED,
      instagram: env.AUTH_INSTAGRAM_ENABLED,
      stripe: env.AUTH_STRIPE_ENABLED
    },
    strategies: {
      local: {
        usernameField: 'email',
        passwordField: 'password',
        usernameLowerCase: true,
        limitAttempts: true,
        maxAttempts: env.NODE_ENV === 'development' ? Number.MAX_VALUE : 5,
        digestAlgorithm: 'sha256',
        encoding: 'hex',
        saltlen: 32,
        iterations: 25000,
        keylen: 512,
        passwordValidator: (password, cb) => {
          if (env.NODE_ENV === 'development') return cb();
          const howStrong = strength(password);
          cb(howStrong < 3 ? new Error('Password not strong enough') : null);
        }
      },
      google: {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${env.WEB_URL}/auth/google/ok`
      }
      // facebook: {},
      // twitter: {},
      // github: {},
      // linkedin: {},
      // instagram: {},
      // stripe: {}
    },
    catchError: async (ctx, next) => {
      try {
        await next();
      } catch (err) {
        if (err.message === 'Consent required')
          return ctx.redirect('/auth/google/consent');
        ctx.flash('error', err.message);
        ctx.redirect('/login');
      }
    },
    callbackOpts: {
      successReturnToOrRedirect: '/',
      failureRedirect: '/login',
      successFlash: true,
      failureFlash: true
    },
    google: {
      accessType: 'offline',
      approvalPrompt: 'force',
      scope: [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
      ]
    }
  },

  // stripe
  stripe: {
    secretKey: env.STRIPE_SECRET_KEY,
    publishableKey: env.STRIPE_PUBLISHABLE_KEY
  }
};

// localization support
config.locales = locales;
config.i18n = i18n;

// merge environment configurations
if (_.isObject(environments[env.NODE_ENV]))
  _.merge(config, environments[env.NODE_ENV]);

// check if we have third party providers enabled
config.auth.hasThirdPartyProviders = _.some(
  config.auth.providers,
  bool => bool
);

// meta support for SEO
config.meta = meta(config);

// add global `config` object to be used by views
config.views.locals.config = config;

module.exports = config;
