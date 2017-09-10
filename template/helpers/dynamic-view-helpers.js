const _ = require('lodash');

const config = require('../config');

module.exports = function(ctx, next) {
  // TODO: secure this with whitelisted keys
  ctx.state = _.extend(ctx.state, config.views.locals);

  // add `ctx` object to the state for views
  ctx.state.ctx = ctx;

  // add flash messages to state
  ctx.state.flash = () => {
    return {
      success: ctx.flash('success'),
      error: ctx.flash('error'),
      info: ctx.flash('info'),
      warning: ctx.flash('warning'),
      question: ctx.flash('question')
    };
  };

  return next();
};
