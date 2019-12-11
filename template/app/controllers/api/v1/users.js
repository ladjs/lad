const Boom = require('@hapi/boom');
const isSANB = require('is-string-and-not-blank');
const { select } = require('mongoose-json-select');

const config = require('../../../../config');
const { Users } = require('../../../models');

async function create(ctx) {
  const { body } = ctx.request;

  if (!isSANB(body.password))
    return ctx.throw(Boom.badRequest(ctx.translate('INVALID_PASSWORD')));

  // register the user
  const query = { email: body.email };
  query[config.userFields.hasVerifiedEmail] = false;
  query[config.userFields.hasSetPassword] = true;
  const user = await Users.register(query, body.password);

  // send a verification email
  await user.sendVerificationEmail();

  // send the response
  const obj = select(user.toObject(), Users.schema.options.toJSON.select);
  obj[config.userFields.apiToken] = user[config.userFields.apiToken];
  ctx.body = obj;
}

async function retrieve(ctx) {
  // since we already have the user object
  // just send it over as a response
  ctx.body = ctx.state.user;
}

async function update(ctx) {
  const { body } = ctx.request;

  ctx.state.user.email = body.email;
  ctx.state.user[config.passport.fields.givenName] =
    body[config.passport.fields.givenName];
  ctx.state.user[config.passport.fields.familyName] =
    body[config.passport.fields.familyName];
  ctx.state.user.avatar_url = body.avatar_url;

  ctx.body = await ctx.state.user.save();
}

module.exports = { create, retrieve, update };
