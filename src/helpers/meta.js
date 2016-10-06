
import sanitizeHtml from 'sanitize-html';
import s from 'underscore.string';
import _ from 'lodash';

import config from '../config';
import logger from './logger';

export default function meta(ctx) {

  let meta = [];

  let nonLocalePath = ctx.path.startsWith(`/${ctx.req.locale}`) ?
    ctx.path.replace(ctx.req.locale, '') : null;

  if (nonLocalePath && nonLocalePath.startsWith('//'))
    nonLocalePath = nonLocalePath.substring(1);

  if (!_.isObject(config.meta)) {
    logger.error('config.meta is not defined');
    return { title: '', description: '' };
  }

  if (!_.isArray(config.meta['/']))
    logger.error('Meta path "/" is not defined in `config.meta`');

  if (_.isArray(config.meta[ctx.path]))
    meta = config.meta[ctx.path];

  if (_.isArray(meta) && nonLocalePath && _.isArray(config.meta[nonLocalePath]))
    meta = config.meta[nonLocalePath];

  if (_.isEmpty(meta)) {
    logger.error('Meta definition defaulted to "/" since no definitions were found');
    meta = config.meta['/'];
  }

  if (meta.length === 0) {
    logger.warn('Meta definition was missing two keys in its array, e.g. [ title, description ]');
    meta = [ '', '' ];
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
    return s.isBlank(str) ? '' : sanitizeHtml(ctx.req.t(str), {
      allowedTags: [],
      allowedAttributes: []
    });
  });

  return {
    title: meta[0],
    description: meta[1]
  };

}

