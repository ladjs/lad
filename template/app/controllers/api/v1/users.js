const Boom = require('@hapi/boom');
const _ = require('lodash');
const isSANB = require('is-string-and-not-blank');

const sendVerificationEmail = require('../../../../helpers/send-verification-email');
const config = require('../../../../config');
const { Users } = require('../../../models');

async function create(ctx) {
  const { body } = ctx.request;

  if (!isSANB(body.password))
    return ctx.throw(Boom.badRequest(ctx.translateError('INVALID_PASSWORD')));

  // register the user
  const query = { email: body.email, locale: ctx.locale };
  query[config.userFields.hasVerifiedEmail] = false;
  query[config.userFields.hasSetPassword] = true;
  query[config.userFields.pendingRecovery] = false;
  query[config.lastLocaleField] = ctx.locale;

  ctx.state.user = await Users.register(query, body.password);

  // send a verification email
  ctx.state.user = await sendVerificationEmail(ctx);

  // send the response
  const object = ctx.state.user.toObject();
  object[config.userFields.apiToken] =
    ctx.state.user[config.userFields.apiToken];
  ctx.body = object;
}

async function retrieve(ctx) {
  // since we already have the user object
  // just send it over as a response
  ctx.body = ctx.state.user.toObject();
}

async function update(ctx) {
  const { body } = ctx.request;

  if (_.isString(body.email)) ctx.state.user.email = body.email;

  if (_.isString(body[config.passport.fields.givenName]))
    ctx.state.user[config.passport.fields.givenName] =
      body[config.passport.fields.givenName];

  if (_.isString(body[config.passport.fields.familyName]))
    ctx.state.user[config.passport.fields.familyName] =
      body[config.passport.fields.familyName];

  if (_.isString(body.avatar_url)) ctx.state.user.avatar_url = body.avatar_url;

  ctx.state.user = await ctx.state.user.save();
  ctx.body = ctx.state.user.toObject();
}

module.exports = { create, retrieve, update };
