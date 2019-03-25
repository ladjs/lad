const githubUsernameRegex = require('github-username-regex');
const isURL = require('is-url');
const isEmail = require('is-email');
const superb = require('superb');
const camelcase = require('camelcase');
const uppercamelcase = require('uppercamelcase');
const slug = require('speakingurl');
const npmConf = require('npm-conf');
const isValidNpmName = require('is-valid-npm-name');

const conf = npmConf();

module.exports = {
  enforceNewFolder: true,
  templateOptions: {
    context: {
      camelcase,
      uppercamelcase,
      slug
    }
  },
  prompts: {
    name: {
      message: 'What is the name of the new project',
      default: ':folderName:',
      validate: val => {
        if (process.env.NODE_ENV === 'test' && val === 'lad') return true;
        return isValidNpmName(val);
      }
    },
    description: {
      message: 'How would you describe the new project',
      default: `my ${superb.random()} project`
    },
    pm: {
      message: 'Choose a package manager',
      choices: ['npm5', 'yarn'],
      type: 'list',
      default: 'npm5',
      store: true
    },
    author: {
      message: "What is your name (the author's)",
      default: conf.get('init-author-name') || ':gitUser:',
      store: true
    },
    email: {
      message: "What is your email (the author's)",
      default: conf.get('init-author-email') || ':gitEmail:',
      store: true,
      validate: val => (isEmail(val) ? true : 'Invalid email')
    },
    website: {
      message: "What is your personal website (the author's)",
      default: conf.get('init-author-url') || '',
      store: true,
      validate: val => (val === '' || isURL(val) ? true : 'Invalid URL')
    },
    username: {
      message: 'What is your GitHub username or organization',
      default: ':gitUser:',
      store: true,
      validate: val =>
        githubUsernameRegex.test(val) ? true : 'Invalid GitHub username'
    },
    repo: {
      message: "What is your GitHub repository's URL",
      default(answers) {
        return `https://github.com/${slug(answers.username)}/${slug(
          slug(answers.name)
        )}`;
      },
      validate: val =>
        isURL(val) &&
        val.indexOf('https://github.com/') === 0 &&
        val.lastIndexOf('/') !== val.length - 1
          ? true
          : 'Please include a valid GitHub.com URL without a trailing slash'
    },
    web: {
      message: 'Do you need a web server',
      type: 'confirm',
      default: true
    },
    i18n: {
      message: 'Do you need automatic multi-lingual support',
      type: 'confirm',
      default: true,
      when: answers => answers.web
    },
    api: {
      message: 'Do you need an API server',
      type: 'confirm',
      default: true
    },
    agenda: {
      message: 'Do you need a job scheduler',
      type: 'confirm',
      default: true
    },
    proxy: {
      message: 'Do you need a proxy (http => https redirect)',
      type: 'confirm',
      default: true
    }
  },
  filters: {
    // until this issue is resolved we need this line:
    // <https://github.com/saojs/sao/issues/59>
    'node_modules/**': false,

    // never copy env file
    '.env': false,

    // ignore standard dev files
    'coverage/**': false,
    'build/**': false,
    '.nyc_output/**': false,
    '*.log': false,

    'web.js': 'web === true',
    'api.js': 'api === true',
    'agenda.js': 'agenda === true',
    'proxy.js': 'proxy === true',
    'jobs/**': 'agenda === true'
  },
  move: {
    // We keep `.gitignore` as `gitignore` in the project
    // Because when it's published to npm
    // `.gitignore` file will be ignored!
    gitignore: '.gitignore',
    README: 'README.md',
    env: '.env'
  },
  post: async ctx => {
    ctx.gitInit();

    // TODO: ctx.answers.agenda
    // - remove from pkg
    // - remove config
    // - remove tests

    // TODO: ctx.answers.web
    // - remove from pkg
    // - remove config
    // - remove tests

    // TODO: ctx.answers.i18n
    // - remove from pkg
    // - remove config
    // - remove tests

    // TODO: ctx.answers.api
    // - remove from pkg
    // - remove config
    // - remove tests

    // TODO: fix `template/package.json` "author" field

    if (ctx.answers.pm === 'yarn') {
      ctx.yarnInstall();
    } else {
      ctx.npmInstall();
    }

    ctx.showTip();
  }
};
