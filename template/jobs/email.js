const { promisify } = require('util');
const os = require('os');
const path = require('path');
const fs = require('fs-extra');
const juice = require('juice');
const uuid = require('uuid');
const basicHtmlToText = require('html-to-text');
const opn = require('opn');
const _ = require('lodash');
const s = require('underscore.string');
const nodemailer = require('nodemailer');
const { htmlToText } = require('nodemailer-html-to-text');
const base64ToS3 = require('nodemailer-base64-to-s3');

const { i18n, logger } = require('../helpers');
const config = require('../config');

const root = path.join(__dirname, '..', 'emails');
const { map, engineSource, extension } = config.views.options;

// create transport and add html to text conversion
const transport = nodemailer.createTransport(config.postmark);
if (config.env !== 'development')
  transport.use(
    'compile',
    base64ToS3({
      cloudFrontDomainName: config.aws.domainName,
      aws: config.aws
    })
  );
transport.use('compile', htmlToText());

// promise version of `juice.juiceResources`
function juiceResources(html, options) {
  return new Promise((resolve, reject) => {
    juice.juiceResources(html, options, (err, html) => {
      if (err) return reject(err);
      resolve(html);
    });
  });
}

// TODO: this should be a package or we should use one that does same thing
// taken from:
// <https://github.com/queckezz/koa-views/blob/master/src/index.js>
function getPaths(abs, rel, ext) {
  return fs
    .stat(path.join(abs, rel))
    .then(stats => {
      if (stats.isDirectory()) {
        // a directory
        return {
          rel: path.join(rel, `index.${ext}`),
          ext
        };
      }
      // a file
      return { rel, ext: path.extname(rel).slice(1) };
    })
    .catch(err => {
      // not a valid file/directory
      if (!path.extname(rel) || path.extname(rel).slice(1) !== ext) {
        // Template file has been provided without the right extension
        // so append to it to try another lookup
        return getPaths(abs, `${rel}.${ext}`, ext);
      }
      throw err;
    });
}

// promise version of consolidate's render
// inspired by koa-views and re-uses the same config
// <https://github.com/queckezz/koa-views>
function renderPromise(view, locals) {
  locals = _.extend(config.views.locals, locals);
  return new Promise(async (resolve, reject) => {
    try {
      const paths = await getPaths(root, view, extension);
      const filePath = path.resolve(root, paths.rel);
      const suffix = paths.ext;
      if (suffix === 'html' && !map) {
        const res = await fs.readFile(filePath, 'utf8');
        resolve(res);
      } else {
        const engineName = map && map[suffix] ? map[suffix] : suffix;
        const render = engineSource[engineName];
        if (!engineName || !render)
          return reject(
            new Error(`Engine not found for the ".${suffix}" file extension`)
          );
        // TODO: convert this to a promise based version
        render(filePath, locals, (err, res) => {
          if (err) return reject(err);
          resolve(res);
        });
      }
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = async function(job, done) {
  if (
    !_.isString(job.attrs.data.template) ||
    s.isBlank(job.attrs.data.template)
  )
    return done(new Error('email `template` missing'));

  if (!_.isString(job.attrs.data.to) || s.isBlank(job.attrs.data.to))
    return done(new Error('email `to` missing'));

  job.attrs.data = _.defaults(job.attrs.data, {
    ...config.email
  });

  try {
    // ensure there is a locals object for rendering
    if (!_.isObject(job.attrs.data.locals)) job.attrs.data.locals = {};

    // if there was a locale object passed
    if (
      _.isString(job.attrs.data.locals.locale) &&
      _.includes(config.locales, job.attrs.data.locals.locale)
    )
      i18n.setLocale(job.attrs.data.locals.locale);
    else if (
      _.isObject(job.attrs.data.locals.user) &&
      _.isString(job.attrs.data.locals.user.last_locale) &&
      _.includes(config.locales, job.attrs.data.locals.user.last_locale)
    )
      // else if the locale was not explicitly set
      // then check if there was a user object
      i18n.setLocale(job.attrs.data.locals.user.last_locale);

    // set i18n in `job.attrs.data.locals`
    const locals = {
      ...job.attrs.data.locals,
      ...i18n.api
    };

    const subject = await renderPromise(
      `${job.attrs.data.template}/subject`,
      locals
    );

    const html = await renderPromise(`${job.attrs.data.template}/html`, {
      ...locals,
      subject
    });

    // transform the html with juice using remote paths
    // google now supports media queries
    // https://developers.google.com/gmail/design/reference/supported_css
    const inlineHtml = await juiceResources(html, {
      preserveImportant: true,
      webResources: {
        relativeTo: path.join(__dirname, '..', 'build')
      }
    });

    const transportOpts = {
      html: inlineHtml,
      subject,
      ..._.omit(job.attrs.data, ['locale', 'locals', 'template'])
    };

    // if we're in development mode then render email template for browser
    if (config.env === 'development') {
      const tmpHtmlPath = `${os.tmpdir()}/${uuid.v4()}.html`;
      const tmpTextPath = `${os.tmpdir()}/${uuid.v4()}.txt`;

      await promisify(fs.writeFile).bind(fs)(tmpHtmlPath, inlineHtml);
      await promisify(fs.writeFile).bind(fs)(
        tmpTextPath,
        basicHtmlToText.fromString(inlineHtml, {
          ignoreImage: true
        })
      );

      await opn(tmpHtmlPath, { wait: false });
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
};
