
import _ from 'lodash';
import s from 'underscore.string';
import Boom from 'boom';

export default function (ctx) {

  // TODO: Filter
  const body = ctx.req.body;

  // ensure number of licenses exists
  if (!_.isString(body.num_licenses) || s.isBlank(body.num_licenses))
    return ctx.throw(Boom.badRequest(ctx.translate('INVALID_NUM_LICENSES')));

  // convert string to whole number
  body.num_licenses = parseInt(body.num_licenses, 10);

  // ensure num_licenses is a number greater than 0
  if (!_.isNumber(body.num_licenses) || body.num_licenses <= 0)
    return ctx.throw(Boom.badRequest(ctx.translate('INVALID_NUM_LICENSES')));

}
