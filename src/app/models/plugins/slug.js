
import s from 'underscore.string';
import _ from 'lodash';
import slug from 'speakingurl';

export default function SlugPlugin(object) {

  return function Plugin(Schema) {

    Schema.add({
      slug: {
        type: String,
        index: true,
        unique: true,
        required: true,
        // TODO: ensure the slug is unique
        validate: function (val, fn) {
          console.log('this', this);
          console.log('this.constructor', this.constructor);
        }
      },
      slug_archive: [{
        type: String,
        index: true
      }]
    });

    Schema.pre('validate', function (next) {

      // set the slug if it is not already set
      if (!_.isString(this.slug) || s.isBlank(this.slug) && _.isString(this.gig_title))
        this.slug = slug(this.gig_title);
      else
        // slugify the slug in case we set it manually and it's not in slug format
        this.slug = slug(this.slug);

      // add the slug to the slug_history
      this.slug_history.push(this.slug);

      // make the slug history unique
      this.slug_history = _.uniq(this.slug_history);

      next();

    });

    return Schema;

  };

}
