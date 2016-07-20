
import _ from 'lodash';
import util from 'util';

const messages = {
  'required': '%s is required',
  'min': '%s below minimum',
  'max': '%s above maximum',
  'enum': '%s not an allowed value',
  'Duplicate value': '%s already exists'
};

export default function parseValidationError(err) {

  // inspired by https://github.com/syntagma/mongoose-error-helper
  if (err.name !== 'ValidationError')
    return err;

  // a ValidationError can contain more than one error
  const errors = [];

  // loop over the errors object of the Validation Error
  _.each(err.errors, field => {

    // if a custom message is defined on the schema
    if (_.isString(field.properties.message))
      errors.push(field.message);
    else if (!_.isString(messages[field.kind]))
      // and if we don't have a message for `kind`
      // then just push the error through
      errors.push(field.message);
    else
      // otherwise use util.format to format message
      // and pass the path for interpolation
      errors.push(util.format(
        messages[field.kind],
        field.path
      ));
  });

  err.message = errors.join(', ');
  return err;

}
