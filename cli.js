#!/usr/bin/env node

// Inspired by:
// <https://github.com/saojs/sao/issues/50>
// <https://github.com/nuxt-community/create-nuxt-app/blob/master/packages/create-nuxt-app/package.json>

const path = require('path');
const cac = require('cac');
const sao = require('sao');
const update = require('update-notifier');

const pkg = require('./package');

const cli = cac();

cli.command('*', 'Generate a new project', input => {
  const folderName = input[0] || '.';
  const targetPath = path.resolve(folderName);
  console.log(`> Generating project in ${targetPath}`);

  const templatePath = path.dirname(require.resolve('./package'));

  return sao({
    template: templatePath,
    targetPath
  });
});

cli.parse();

update({ pkg }).notify();
