
import meta from './meta';

export default function dynamicViewHelpers(ctx, next) {

  // lookup page metadata information such as title and description
  if (ctx.method === 'GET' && !ctx.xhr)
    ctx.state.meta = meta(ctx);

  // add `user` object to the state for views
  if (ctx.isAuthenticated())
    ctx.state.user = ctx.state.user.toObject();

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

}
