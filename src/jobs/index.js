
import moment from 'moment';
import accounting from 'accounting';
import htmlToText from 'html-to-text';
import promisify from 'es6-promisify';
import os from 'os';
import fs from 'fs';
import opn from 'opn';
import nunjucks from 'nunjucks';
import { EmailTemplate } from 'email-templates';
import s from 'underscore.string';
import _ from 'lodash';
import nodemailer from 'nodemailer';
import { htmlToText as htmlToTextPlugin } from 'nodemailer-html-to-text';
import { Logger } from '../helpers';
import config from '../config';
import path from 'path';

// configure nunjucks for email rendering
const njk = nunjucks.configure(config.nunjucks);
_.forOwn(config.nunjucks.filters, (value, key) => njk.addFilter(key, value));
_.forOwn(config.nunjucks.globals, (value, key) => njk.addGlobal(key, value));

export default class Jobs {

  getJobs() {
    return [
      [ 'email', {}, this.email ],
      [ 'locales', {}, this.locales ]
    ];
  }

  async email(job, done) {

    if (!_.isString(job.attrs.data.template)
      || s.isBlank(job.attrs.data.template))
      return done(new Error('email `template` missing'));

    if (!_.isString(job.attrs.data.to) || s.isBlank(job.attrs.data.to))
      return done(new Error('email `to` missing'));

    job.attrs.data = _.defaults(job.attrs.data, {
      ...config.email
    });

    try {

      // create transport and add html to text conversion
      const transport = nodemailer.createTransport(config.postmark);
      transport.use('compile', htmlToTextPlugin());

      const template = new EmailTemplate(
        path.join(__dirname, '..', 'emails', job.attrs.data.template)
      );

      if (!_.isObject(job.attrs.data.locals))
        job.attrs.data.locals = {};


      const results = await template.render({
        // avoid max call stack
        ... job.attrs.data.locals,
        // add to locals some utility libraries
        moment,
        _,
        accounting
      });

      const transportOptions = {
        ...results,
        from: job.attrs.data.from,
        to: job.attrs.data.to,
        attachments: job.attrs.data.attachments,
        headers: job.attrs.data.headers
      };

      // if we're in development mode then render the email template for browser viewing
      if (config.env === 'development') {
        transportOptions.tmpHtmlPath = `${os.tmpdir()}/email.html`;
        transportOptions.tmpTextPath = `${os.tmpdir()}/text.txt`;
        await promisify(fs.writeFile)(transportOptions.tmpHtmlPath, results.html);
        await promisify(fs.writeFile)(
          transportOptions.tmpTextPath,
          htmlToText.fromString(results.html)
        );
        const html = await njk.render(
          path.join(__dirname, '..', 'emails', 'preview.njk'),
          transportOptions
        );
        const previewPath = `${os.tmpdir()}/preview.html`;
        await promisify(fs.writeFile)(previewPath, html);
        opn(previewPath);
        done();
        return;
      }

      const res = await transport.sendMail(transportOptions);

      Logger.info('email sent', { extra: res });

      done();

    } catch (err) {
      done(err);
    }

  }

  async locales(job, done) {

    const defaultFields = _.zipObject(
      _.values(config.i18n),
      _.values(config.i18n)
    );

    const missingLocales = [];

    try {
      await Promise.all(config.locales.map(locale => {
        return new Promise(async (resolve, reject) => {

          const filePath = path.join(
            config.localesDirectory,
            `${locale}.json`
          );

          // look up the file, and if it does not exist, then
          // create it with an empty object
          let file;
          try {
            file = require(filePath);
          } catch (err) {
            file = {};
          }

          // warn if the file was empty (and not `en` default)
          // and subsequently do not create the file
          if (_.isEmpty(file) && locale !== 'en') {
            missingLocales.push(locale);
            return resolve();
          }

          if (locale !== 'en') {

            // warn of any fields that are missing in the locale file
            const notFound = _.difference(
              _.values(config.i18n),
              _.keys(file)
            );

            if (notFound.length > 0)
              Logger.warn([
                `the following phrases were missing from ${locale}:`,
                ...notFound
              ].join('\n'));

            // warn if any fields that no longer exist in the locale file
            const noLongerExist = _.difference(
              _.keys(file),
              _.values(config.i18n)
            );

            if (noLongerExist.length > 0)
              Logger.warn([
                `the following phrases from ${locale} no longer exist:`,
                ...noLongerExist
              ].join('\n'));

          }

          if (locale === 'en') {
            // add any missing fields if they don't exist
            file = _.defaultsDeep(file, defaultFields);
            // omit any fields that don't exist anymore
            file = _.pick(file, _.values(config.i18n));
          }

          // write the file again
          try {
            await fs.writeFile(
              filePath,
              JSON.stringify(file, null, 2)
            );
            resolve();
          } catch (err) {
            reject(err);
          }

        });

      }));

      if (missingLocales.length > 0)
        Logger.warn(
          `the following locales were missing: ${missingLocales.join(', ')}`
        );

      done();

    } catch (err) {
      done(err);
    }

  }

}
