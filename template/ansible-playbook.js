const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const parse = require('parse-git-config');

const env = path.join(__dirname, '.env.production');

if (!fs.existsSync(env))
  throw new Error(`.env.production file missing: ${env}`);

if (!fs.statSync(env).isFile())
  throw new Error(`.env.production file missing: ${env}`);

// this will populate process.env with
// environment variables from dot env file
require('@ladjs/env')({
  path: env,
  defaults: path.join(__dirname, '.env.defaults'),
  schema: path.join(__dirname, '.env.schema')
});

// set git config url
process.env.GITHUB_REPO = parse.sync({
  path: path.join(__dirname, '.git', 'config')
})['remote "origin"'].url;

if (!execSync('which ansible-playbook'))
  throw new Error('ansible-playbook is required to be installed on this os');

execSync(`ansible-playbook ${process.argv.slice(2).join(' ')}`);
