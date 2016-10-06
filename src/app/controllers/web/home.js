
export default async function home(ctx, next) {
  const referrer = ctx.get('referrer');
  if ([ 'https://news.ycombinator.com', 'https://www.producthunt.com' ].includes(referrer))
    ctx.flash('success', 'Welcome Hacker News and Product Hunt friends!');
  await ctx.render('home');
}
