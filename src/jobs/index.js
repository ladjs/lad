
import { FileMinifyLoader } from 'nunjucks-minify-loaders';
import juice from 'juice';
import uuid from 'uuid';
import GoogleTranslate from 'google-translate';
import htmlToText from 'html-to-text';
import promisify from 'es6-promisify';
import os from 'os';
import fs from 'fs';
import opn from 'opn';
import nunjucks from 'nunjucks';
import s from 'underscore.string';
import _ from 'lodash';
import nodemailer from 'nodemailer';
import { htmlToText as htmlToTextPlugin } from 'nodemailer-html-to-text';
import base64ToS3 from 'nodemailer-base64-to-s3';
import path from 'path';
import NunjucksCodeHighlight from 'nunjucks-highlight.js';
import hljs from 'highlight.js';

import { i18n, logger } from '../helpers';
import config from '../config';

const highlight = new NunjucksCodeHighlight(nunjucks, hljs);

// create transport and add html to text conversion
const transport = nodemailer.createTransport(config.postmark);
transport.use('compile', base64ToS3({
  cloudFrontDomainName: config.aws.domainName,
  aws: config.aws
}));
transport.use('compile', htmlToTextPlugin());

// setup google translate with api key
const googleTranslate = new GoogleTranslate(config.googleTranslateKey);
// convert to a promise the translation function
const translate = promisify(googleTranslate.translate, googleTranslate);

// promise version of `juice.juiceResources`
function juiceResources(html, options) {
  return new Promise((resolve, reject) => {
    juice.juiceResources(html, options, (err, html) => {
      if (err) return reject(err);
      resolve(html);
    });
  });
}

// configure nunjucks for email rendering
const loader = new FileMinifyLoader(
  path.join(__dirname, '..', 'emails', '/'),
  config.nunjucks
);
const env = new nunjucks.Environment(loader);
env.addExtension('NunjucksCodeHighlight', highlight);

// promise version of `env.render`
function render(view, locals) {
  return new Promise((resolve, reject) => {
    env.render(`${view}.njk`, locals, (err, res) => {
      if (err) return reject(err);
      resolve(res);
    });
  });
}
function filterWrapper(filter) {
  return (...args) => {
    const callback = args.pop();
    Promise.resolve(filter(...args)).then(
      val => callback(null, val),
      err => callback(err, null)
    );
  };
}
Object.keys(config.nunjucks.filters).forEach(filterKey => {
  env.addFilter(filterKey, filterWrapper(config.nunjucks.filters[filterKey]), true);
});
Object.keys(config.nunjucks.globals).forEach(globalKey => {
  env.addGlobal(globalKey, config.nunjucks.globals[globalKey]);
});

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

    // ensure there is a locals object for rendering
    if (!_.isObject(job.attrs.data.locals))
      job.attrs.data.locals = {};

    // if there was a locale object passed
    if (_.isString(job.attrs.data.locals.locale)
      && _.includes(config.locales, job.attrs.data.locals.locale))
      i18n.setLocale(job.attrs.data.locals.locale);
    // else if the locale was not explicitly set
    // then check if there was a user object
    else if (_.isObject(job.attrs.data.locals.user)
      && _.isString(job.attrs.data.locals.user.last_locale)
      && _.includes(config.locales, job.attrs.data.locals.user.last_locale))
      i18n.setLocale(job.attrs.data.locals.user.last_locale);

    // set i18n in `job.attrs.data.locals`
    const locals = {
      ... job.attrs.data.locals,
      ... i18n.api
    };

    const subject = await render(`${job.attrs.data.template}/subject`, locals);

    const html = await render(`${job.attrs.data.template}/html`, {
      ...locals,
      subject
    });

    // TODO: add support for custom text

    // transform the html with juice using remote paths
    // google now supports media queries
    // https://developers.google.com/gmail/design/reference/supported_css
    const inlineHtml = await juiceResources(html, {
      preserveImportant: true,
      webResources: {
        relativeTo: path.join(__dirname, '..', '..', 'build')
      }
    });

    const transportOpts = {
      html: inlineHtml,
      subject,
      ... _.omit(job.attrs.data, [ 'locale', 'locals', 'template' ])
    };

    // if we're in development mode then render the email template for browser viewing
    if (config.env === 'development') {

      const tmpHtmlPath = `${os.tmpdir()}/${uuid.v4()}.html`;
      const tmpTextPath = `${os.tmpdir()}/${uuid.v4()}.txt`;

      await promisify(fs.writeFile)(tmpHtmlPath, inlineHtml);
      await promisify(fs.writeFile)(tmpTextPath, htmlToText.fromString(inlineHtml, {
        ignoreImage: true
      }));

      await opn(tmpHtmlPath, { wait: false });
      // await opn(tmpTextPath, { wait: false });

    }

    if (!config.sendEmail) {
      logger.info('Email sending has been disabled');
      return done();
    }

    const res = await transport.sendMail(transportOpts);

    logger.info('email sent', { extra: res });

    done();

  } catch (err) {
    done(err);
  }

}

export async function locales(job, done) {

  const defaultFields = _.zipObject(
    _.values(config.i18n),
    _.values(config.i18n)
  );

  const defaultLocaleFilePath = path.join(
    config.localesDirectory,
    `${config.defaultLocale}.json`
  );

  let defaultLocaleFile;
  try {
    defaultLocaleFile = require(defaultLocaleFilePath);
  } catch (err) {
    defaultLocaleFile = {};
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

        // if the locale is not the default, then check if translations need done
        if (locale !== config.defaultLocale) {

          const translationsRequired = _.intersection(
            _.uniq(
              _.concat(
                _.values(config.i18n),
                _.values(defaultLocaleFile)
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

            // TODO: prevent %s %d and %j from getting translated
            // <https://nodejs.org/api/util.html#util_util_format_format>
            //
            // TODO: also prevent {{...}} from getting translated
            // by wrapping such with `<span class="notranslate">`?

            // only give the Google API a few seconds to finish
            return Promise.race([
              new Promise((resolve, reject) => {
                setTimeout(() => {
                  logger.info('Google Translate API did not respond in 4s');
                  resolve();
                }, 20000);
              }),
              translate(phrase, locale)
            ]);
          });

          // get the translation results from Google
          try {
            const results = await Promise.all(promises);
            _.each(_.compact(results), result => {
              // replace `|` pipe character because translation will interpret as ranged interval
              // <https://github.com/mashpie/i18n-node/issues/274>
              // TODO: maybe we should use `he` package to re-encode entities?
              file[result.originalText] = result.translatedText.replace(/\|/g, '&#124;');
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
