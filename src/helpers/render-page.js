
export default function renderPage(page) {
  return async function(ctx) {
    await ctx.render(page);
  };
}
