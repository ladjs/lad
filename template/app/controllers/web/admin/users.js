const paginate = require('koa-ctx-paginate');

const { Users } = require('../../../models');

const list = async ctx => {
  try {
    const [users, itemCount] = await Promise.all([
      Users.find({})
        .limit(ctx.query.limit)
        .skip(ctx.paginate.skip)
        .lean()
        .sort('-created_at')
        .exec(),
      Users.count({})
    ]);

    const pageCount = Math.ceil(itemCount / ctx.query.limit);

    await ctx.render('admin/users', {
      users,
      pageCount,
      itemCount,
      pages: paginate.getArrayPages(ctx)(3, pageCount, ctx.query.page)
    });
  } catch (err) {
    ctx.throw(err);
  }
};

const update = ctx => {
  ctx.throw('coming soon');
};

const remove = ctx => {
  ctx.throw('coming soon');
};

module.exports = { list, update, remove };
