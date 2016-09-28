
import chalk from 'chalk';
import updateNotifier from 'update-notifier';
import _ from 'lodash';
import path from 'path';
import YAML from 'yamljs';
import boxen from 'boxen';

import Logger from './logger';
import config from '../config';

export default function updateNotifierHelper() {

  const yaml = YAML.load(path.join(__dirname, '..', '..', '.crocodile.yml'));

  if (!_.isObject(yaml))
    return Logger.error('You are missing a ".crocodile.yml" file in the root of your project');

  if (!_.isObject(yaml.crocodile))
    return Logger.error('You must have a `crocodile` block in the ".crocodile.yml" file');

  if (!_.isString(yaml.crocodile.version))
    return Logger.error('Version was missing in the `crocodile` block of the YAML file');

  const pkg = {
    name: 'crocodile',
    version: yaml.crocodile.version
  };

  const notifier = updateNotifier({ pkg, updateCheckInterval: config.updateCheckInterval });

  if (!_.isObject(notifier.update))
    return notifier;

  /* eslint-disable max-len */
  const message = [
    `CrocodileJS update available: ${chalk.green.bold(notifier.update.latest)} ${chalk.gray(`(current: ${notifier.update.current})`)}`,
    '',
    `Run ${chalk.magenta.bold('crocodile update')} to read about this update on GitHub.`,
    '',
    `Don't have crocodile installed?  Run ${chalk.magenta.bold(`npm install -g ${pkg.name}`)} to install.`,
    '',
    `${chalk.gray('Already updated or want to ignore this?  Change the version in your .crocodile.yml file to match!')}`,
    '',
    `${chalk.magenta.bold('https://crocodilejs.com')}`
  ];
  /* eslint-enable max-len */

  console.log(boxen(message.join('\n'), {
    borderStyle: 'round',
    borderColor: 'green',
    margin: 1,
    padding: 1,
    align: 'center'
  }));

  return notifier;

}
