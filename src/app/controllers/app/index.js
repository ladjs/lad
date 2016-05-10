
async function home(ctx) {
  await ctx.render('home');
}

async function status(ctx) {
  ctx.body = { status: 'online' };
}

export default {
  home,
  status
};
