const fs = require('fs');
const path = require('path');

const shell = require('shelljs');
const parse = require('parse-git-config');

const env = path.join(__dirname, '.env.production');

if (!fs.existsSync(env)) {
  shell.echo(`.env.production file missing: ${env}`);
  shell.exit(1);
}

if (!fs.statSync(env).isFile()) {
  shell.echo(`.env.production file missing: ${env}`);
  shell.exit(1);
}

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

if (!shell.which('ansible-playbook')) {
  shell.echo('ansible-playbook is required to be installed on this os');
  shell.exit(1);
}

shell.exec(`ansible-playbook ${process.argv.slice(2).join(' ')}`);
