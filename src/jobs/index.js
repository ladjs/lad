
import GoogleTranslate from 'google-translate';
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
import { logger } from '../helpers';
import config from '../config';
import path from 'path';

// setup google translate with api key
const googleTranslate = new GoogleTranslate(config.googleTranslateKey);

// convert to a promise the translation function
const translate = promisify(googleTranslate.translate, googleTranslate);

// configure nunjucks for email rendering
const njk = nunjucks.configure(config.nunjucks);
_.forOwn(config.nunjucks.filters, (value, key) => njk.addFilter(key, value));
_.forOwn(config.nunjucks.globals, (value, key) => njk.addGlobal(key, value));

export function getJobs() {
  return [
    [ 'email', {}, this.email ],
    [ 'locales', {}, this.locales ]
  ];
}

export async function email(job, done) {

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
      ... results,
      ... _.omit(job.attrs.data, [ 'locals', 'template' ])
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
      await opn(previewPath);
      done();
      return;
    }

    const res = await transport.sendMail(transportOptions);

    logger.info('email sent', { extra: res });

    done();

  } catch (err) {
    done(err);
  }

}

export async function locales(job, done) {

  // TODO: ensure files are synced
  const defaultFields = _.zipObject(
    _.values(config.i18n),
    _.values(config.i18n)
  );

  const englishFilePath = path.join(
    config.localesDirectory,
    'en.json'
  );

  let englishFile;
  try {
    englishFile = require(englishFilePath);
  } catch (err) {
    englishFile = {};
  }

  try {
    await Promise.all(config.locales.map(locale => {
      logger.info(`checking locale of "${locale}"`);
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

        // add any missing fields if they don't exist
        file = _.defaultsDeep(file, defaultFields);

        // if the locale is not english, then check if translations need done
        if (locale !== 'en') {

          const translationsRequired = _.intersection(
            _.uniq(
              _.concat(
                _.values(config.i18n),
                _.values(englishFile)
              )
            ),
            _.values(file)
          );

          if (translationsRequired.length > 0)
            logger.warn([
              `the following phrases need translated in ${locale}:`,
              ...translationsRequired
            ].join('\n'));

          // attempt to translate all of these in the given language
          const promises = _.map(translationsRequired, phrase => {
            // prevent %s %d and %j from getting translated
            // <https://nodejs.org/api/util.html#util_util_format_format>
            // also prevent {{...}} from getting translated
            // by wrapping such with `<span class="notranslate">`
            return translate(phrase, locale);
          });

          // get the translation results from Google
          try {
            const results = await Promise.all(promises);
            _.each(results, result => {
              file[result.originalText] = result.translatedText;
            });
          } catch (err) {
            logger.error(err);
          }

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

    done();

  } catch (err) {
    done(err);
  }

}
