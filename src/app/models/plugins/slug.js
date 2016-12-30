
import s from 'underscore.string';
import _ from 'lodash';
import slug from 'speakingurl';

import { logger, i18n } from '../../../helpers';

export function getUniqueSlug(constructor, _id, str, i = 0) {
  return new Promise(async (resolve, reject) => {
    try {
      const search = i === 0 ? str : `${str}-${i}`;
      const count = await constructor.count({
        _id: {
          $ne: _id
        },
        slug: search
      });
      if (count === 0) return resolve(search);
      resolve(getUniqueSlug(constructor, _id, str, i + 1));
    } catch (err) {
      reject(err);
    }
  });

}

export default function SlugPlugin(tmpl = '', ERROR_KEY = 'INVALID_SLUG') {

  return function Plugin(Schema) {

    Schema.add({
      slug: {
        type: String,
        index: true,
        unique: true,
        required: true,
        trim: true,
        validate: async function (val, fn) {
          if (!_.isString(val) || s.isBlank(val))
            return fn(false, i18n.translate(ERROR_KEY, this.locale));
          fn(true);
        }
      },
      slug_archive: [{
        type: String,
        index: true
      }]
    });

    Schema.pre('validate', async function (next) {

      try {

        const str = _.template(tmpl)(this);

        // set the slug if it is not already set
        if (!_.isString(this.slug) || s.isBlank(this.slug))
          this.slug = slug(str);
        else
          // slugify the slug in case we set it manually and it's not in slug format
          this.slug = slug(this.slug);

        // ensure that the slug is unique
        this.slug = await getUniqueSlug(
          this.constructor,
          this._id,
          this.slug
        );

        // create slug history if it does not exist yet
        if (!_.isArray(this.slug_history))
          this.slug_history = [];

        // add the slug to the slug_history
        this.slug_history.push(this.slug);

        // make the slug history unique
        this.slug_history = _.uniq(this.slug_history);

        next();

      } catch (err) {
        logger.error(err);
        err.message = i18n.translate(ERROR_KEY, this.locale);
        next(err);
      }

    });

    return Schema;

  };

}
