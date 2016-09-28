
import moment from 'moment';
import 'isomorphic-fetch';
import Frisbee from 'frisbee';
import s from 'underscore.string';
import chalk from 'chalk';
import _ from 'lodash';
import path from 'path';
import YAML from 'yamljs';
import boxen from 'boxen';

import config from '../config';
import Logger from './logger';

export default async function checkLicense() {

  const yaml = YAML.load(path.join(__dirname, '..', '..', '.crocodile.yml'));

  if (!_.isObject(yaml))
    return Logger.error('You are missing a ".crocodile.yml" file in the root of your project');

  if (!_.isObject(yaml.crocodile))
    return Logger.error('You must have a `crocodile` block in the ".crocodile.yml" file');

  if (!_.isString(yaml.crocodile.license) || s.isBlank(yaml.crocodile.license)) {
    /* eslint-disable max-len */
    output([
      `CrocodileJS commercial license key was ${chalk.red.bold('not detected')}.`,
      '',
      `Using for commercial purposes? Purchase your license + ${chalk.green.bold('get free t-shirt')}!`,
      '',
      `Run ${chalk.magenta.bold('crocodile license')} or visit the website link below`,
      '',
      `${chalk.gray('Already have a license key?  Add it to your .crocodile.yml file to hide this message.')}`,
      '',
      `${chalk.magenta.bold('https://crocodilejs.com')}`
    ]);
    /* eslint-enable max-len */
    return;
  }

  // check if the license key is valid on file
  const api = new Frisbee({
    baseURI: config.licenseKeyCheckURL,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  });

  console.log('api', api);

  try {

    // send the request
    const res = await api.get(`/v1/license-key/${yaml.crocodile.license.trim()}`);

    // check if any errors occurred
    if (res.err) throw res.err;

    if (!_.isObject(res.body)
      || !_.isString(res.body.desc)
      || !_.isString(res.body.created_at))
      throw new Error('Missing `desc` and `created_at` in the body');

    /* eslint-disable max-len */
    output([
      `CrocodileJS commercial license key was ${chalk.green.bold('valid')}.`,
      '',
      `Your license key was purchased on ${moment(res.body.created_at).format('MM/DD/YY h:mm A')}.`,
      '',
      `It is valid for "${res.body.desc}".`,
      '',
      `${chalk.magenta.bold('https://crocodilejs.com')}`
    ]);
    /* eslint-enable max-len */

  } catch (err) {
    Logger.error(err);
    /* eslint-disable max-len */
    output([
      `CrocodileJS commercial license key was ${chalk.red.bold('invalid')}.`,
      '',
      'Please make sure that you entered the license key correctly.',
      '',
      `Run ${chalk.magenta.bold('crocodile license')} or visit the website link below`,
      '',
      `${chalk.gray('Already have a license key?  Add it to your .crocodile.yml file to hide this message.')}`,
      '',
      `${chalk.magenta.bold('https://crocodilejs.com')}`
    ]);
    /* eslint-enable max-len */
  }

}

function output(message) {
  console.log(boxen(message.join('\n'), {
    borderStyle: 'round',
    borderColor: 'red',
    margin: 1,
    padding: 1,
    align: 'center'
  }));
}
