async function keys(ctx) {
  // this is like a migration, it will automatically add token + keys if needed
  await ctx.state.user.save();
  return ctx.render('otp/setup');
}

module.exports = keys;
