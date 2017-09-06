module.exports = function(page) {
  return async function(ctx) {
    await ctx.render(page);
  };
};
