
import moment from 'moment';
import _ from 'lodash';
import i18n from 'i18n';

import logger from './logger';
import config from '../config';

i18n.configure({
  directory: config.localesDirectory,
  logDebugFn: logger.debug,
  logWarnFn: logger.warn,
  logErrorFn: logger.error,
  indent: '  ',
  api: {
    __: 't',
    __n: 'tn'
  },
  syncFiles: true,
  autoReload: true,
  updateFiles: true
});

i18n.t = i18n.__;
i18n.tn = i18n.__n;

i18n.translate = function translate(key, locale) {
  let args = _.values(arguments).slice(2);
  if (_.isUndefined(args))
    args = [];
  const phrase = config.i18n[key];
  if (!_.isString(phrase)) {
    logger.warn(`translation key missing: ${key}`);
    return;
  }
  args = [
    { phrase, locale },
    ... args
  ];
  return i18n.t(... args);
};

i18n.middleware = function middleware(ctx, next) {

  // inspired by nodejs.org language support
  // <https://github.com/nodejs/nodejs.org/blob/master/server.js#L38-L58>
  const locale = ctx.url.split('/')[1];
  const hasLang = _.includes(config.locales, locale);

  if (!hasLang) {
    ctx.status = 302;
    return ctx.redirect(`/${ctx.i18n.locale}${ctx.url}`);
  }

  // set the cookie for future requests
  ctx.cookies.set('locale', locale, {
    signed: true,
    expires: moment().add(1, 'year').toDate(),
    // TODO: probably need to change this
    secure: !_.isEmpty(config.ssl.web)
  });

  return next();

};

export default i18n;
