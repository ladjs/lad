const s = require('underscore.string');
const _ = require('lodash');
const slug = require('speakingurl');

const { logger, i18n } = require('../../../helpers');

function getUniqueSlug(constructor, _id, str, i = 0) {
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

// TODO: publish mongoose-common

// TODO: publish mongoose-username plugin that has twitter inspired

//
// TODO: the following notes:
//
// a function that lets you look up a slug history
// findSlugInHistory and document how to do a redirect properly

// be able to plug in any slug library you want
// e.g. `speakingurl`, `limax`, `slug` whatever
// then growth hack it by submitting PR's to all of those repos
// telling users they can use this package if they're using mongoose
// and it will take care of slugging automatically
//
// allow `slug_history` to be configurable, e.g. could be `slugs`
// like mongoose-slug has
//
// also mention its a drop-in replacement for `mongoose-slug`
// document 302 redirect example
//
// message @campbelljeffm on slack mongoose
//
// document this plugin and all other mongoose plugins I've made to mongoose
// official repo and documentation (@mention val on mongoose slack to do this)
//
// document how you might do i18n translation for mongoose validation error
// for this slug package
function SlugPlugin(tmpl = '', ERROR_KEY = 'INVALID_SLUG') {
  return function(Schema) {
    Schema.add({
      slug: {
        type: String,
        index: true,
        unique: true,
        required: true,
        trim: true,
        validate: {
          isAsync: false,
          validator(val, fn) {
            if (!_.isString(val) || s.isBlank(val))
              return fn(false, i18n.translate(ERROR_KEY, this.locale));
            fn(true);
          }
        }
      },
      slug_archive: [
        {
          type: String,
          index: true
        }
      ]
    });

    Schema.pre('validate', async function(next) {
      try {
        const str = _.template(tmpl)(this);

        // set the slug if it is not already set
        if (!_.isString(this.slug) || s.isBlank(this.slug)) {
          this.slug = slug(str);
        } else {
          // slugify the slug in case we set it manually and not in slug format
          this.slug = slug(this.slug);
        }

        // ensure that the slug is unique
        this.slug = await getUniqueSlug(this.constructor, this._id, this.slug);

        // create slug history if it does not exist yet
        if (!_.isArray(this.slug_history)) this.slug_history = [];

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

module.exports = { getUniqueSlug, SlugPlugin };
