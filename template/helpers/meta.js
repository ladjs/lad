const sanitizeHtml = require('sanitize-html');
const s = require('underscore.string');
const _ = require('lodash');

const config = require('../config');
const { logger } = require('.');

module.exports = function(ctx) {
  let meta = [];

  let nonLocalePath = ctx.path.startsWith(`/${ctx.req.locale}`)
    ? ctx.path.replace(ctx.req.locale, '')
    : null;

  if (nonLocalePath && nonLocalePath.startsWith('//'))
    nonLocalePath = nonLocalePath.substring(1);

  if (!_.isObject(config.meta)) {
    logger.error('config.meta is not defined');
    return { title: '', description: '' };
  }

  if (!_.isArray(config.meta['/']))
    logger.error('Meta path "/" is not defined in `config.meta`');

  if (_.isArray(config.meta[ctx.path])) meta = config.meta[ctx.path];

  if (_.isArray(meta) && nonLocalePath && _.isArray(config.meta[nonLocalePath]))
    meta = config.meta[nonLocalePath];

  if (_.isEmpty(meta)) {
    logger.error(
      'Meta definition defaulted to "/" since no definitions were found'
    );
    meta = config.meta['/'];
  }

  if (meta.length === 0) {
    logger.warn(
      'Meta definition missing two keys in array, e.g. [ title, description ]'
    );
    meta = ['', ''];
  }

  // if no title was found then just show a warning
  if (!_.isString(meta[0])) {
    logger.error('Meta title was not a string');
    meta[0] = '';
  }

  // if no description was found then just show a warning
  if (!_.isString(meta[1])) {
    logger.warn('Meta description was not a string');
    meta[1] = '';
  }

  // slice only the first two keys
  meta = meta.slice(0, 2);

  // translate the meta information
  meta = _.map(meta, str => {
    // replace `|` pipe character because
    // translation will interpret as ranged interval
    // <https://github.com/mashpie/i18n-node/issues/274>
    str = str.replace(/\|/g, '&#124;');
    if (s.isBlank(str)) return '';
    return sanitizeHtml(ctx.req.t(str), {
      allowedTags: [],
      allowedAttributes: []
    });
  });

  return {
    title: meta[0],
    description: meta[1]
  };
};
