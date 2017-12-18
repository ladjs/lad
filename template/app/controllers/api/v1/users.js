const Boom = require('boom');
const s = require('underscore.string');
const validator = require('validator');
const _ = require('lodash');
const { select } = require('mongoose-json-select');

const { Users } = require('../../../models');

const create = async ctx => {
  const { body } = ctx.request;

  if (!_.isString(body.email) || !validator.isEmail(body.email))
    return ctx.throw(Boom.badRequest(ctx.translate('INVALID_EMAIL')));

  if (!_.isString(body.password) || s.isBlank(body.password))
    return ctx.throw(Boom.badRequest(ctx.translate('INVALID_PASSWORD')));

  // register the user
  try {
    const user = await Users.registerAsync({ email: body.email }, body.password);

    // send the response
    ctx.body = {
      ...select(user.toObject(), Users.schema.options.toJSON.select),
      api_token: user.api_token
    };
  } catch (err) {
    ctx.throw(Boom.badRequest(err.message));
  }
};

const retrieve = async ctx => {
  // since we already have the user object
  // just send it over as a response
  ctx.body = ctx.state.user;
};

const update = async ctx => {
  // set fields we allow to be updated
  const fields = ['email', 'display_name', 'given_name', 'family_name', 'avatar_url'];

  // extend the user object
  // (basically overwrites or "extends" the existing fields)
  ctx.state.user = _.extend(ctx.state.user, _.pick(ctx.request.body, fields));

  // save the user (allow mongoose to handle validation)
  ctx.state.user = await ctx.state.user.save();

  // send the response
  ctx.body = ctx.state.user;
};

module.exports = { create, retrieve, update };
