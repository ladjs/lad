const githubUsernameRegex = require('github-username-regex');
const isURL = require('is-url');
const isEmail = require('is-email');
const superb = require('superb');
const camelcase = require('camelcase');
const uppercamelcase = require('uppercamelcase');
const slug = require('limax');
const npmConf = require('npm-conf');

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
      default: ':folderName:'
    },
    description: {
      message: 'How would you describe the new project',
      default: `my ${superb()} project`
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
      validate: val => {
        return isURL(val) &&
        val.indexOf('https://github.com/') === 0 &&
        val.lastIndexOf('/') !== val.length - 1
          ? true
          : 'Please include a valid GitHub.com URL without a trailing slash';
      }
    }
  },
  move: {
    // We keep `.gitignore` as `gitignore` in the project
    // Because when it's published to npm
    // `.gitignore` file will be ignored!
    gitignore: '.gitignore',
    README: 'README.md'
  },
  post: async ctx => {
    ctx.gitInit();

    if (ctx.answers.pm === 'yarn') {
      ctx.yarnInstall();
    } else {
      ctx.npmInstall();
    }

    ctx.showTip();
  }
};
