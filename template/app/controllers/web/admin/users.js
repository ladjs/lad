const paginate = require('koa-ctx-paginate');

const { Users } = require('../../../models');
const config = require('../../../../config');

async function list(ctx) {
  const [users, itemCount] = await Promise.all([
    Users.find({})
      .limit(ctx.query.limit)
      .skip(ctx.paginate.skip)
      .lean()
      .sort('-created_at')
      .exec(),
    Users.countDocuments({})
  ]);

  const pageCount = Math.ceil(itemCount / ctx.query.limit);

  await ctx.render('admin/users', {
    users,
    pageCount,
    itemCount,
    pages: paginate.getArrayPages(ctx)(3, pageCount, ctx.query.page)
  });
}

async function retrieve(ctx) {
  ctx.state.result = await Users.findById(ctx.params.id);
  if (!ctx.state.result) throw new Error(ctx.translate('INVALID_USER'));
  await ctx.render('admin/users/retrieve');
}

async function update(ctx) {
  const user = await Users.findById(ctx.params.id);
  if (!user) throw new Error(ctx.translate('INVALID_USER'));
  const { body } = ctx.request;

  user[config.passport.fields.givenName] =
    body[config.passport.fields.givenName];
  user[config.passport.fields.familyName] =
    body[config.passport.fields.familyName];
  user.email = body.email;
  user.group = body.group;

  await user.save();

  if (user.id === ctx.state.user.id) await ctx.login(user);

  ctx.flash('custom', {
    title: ctx.request.t('Success'),
    text: ctx.translate('REQUEST_OK'),
    type: 'success',
    toast: true,
    showConfirmButton: false,
    timer: 3000,
    position: 'top'
  });

  if (ctx.accepts('html')) ctx.redirect('back');
  else ctx.body = { reloadPage: true };
}

async function remove(ctx) {
  const user = await Users.findById(ctx.params.id);
  if (!user) throw new Error(ctx.translate('INVALID_USER'));
  await user.remove();
  ctx.flash('custom', {
    title: ctx.request.t('Success'),
    text: ctx.translate('REQUEST_OK'),
    type: 'success',
    toast: true,
    showConfirmButton: false,
    timer: 3000,
    position: 'top'
  });

  if (ctx.accepts('html')) ctx.redirect('back');
  else ctx.body = { reloadPage: true };
}

async function login(ctx) {
  const user = await Users.findById(ctx.params.id);
  if (!user) throw new Error(ctx.translate('INVALID_USER'));

  ctx.logout();

  await ctx.login(user);

  ctx.flash('custom', {
    title: ctx.request.t('Success'),
    text: ctx.translate('REQUEST_OK'),
    type: 'success',
    toast: true,
    showConfirmButton: false,
    timer: 3000,
    position: 'top'
  });

  if (ctx.accepts('html')) ctx.redirect('/');
  else ctx.body = { redirectTo: '/' };
}

module.exports = { list, retrieve, update, remove, login };
