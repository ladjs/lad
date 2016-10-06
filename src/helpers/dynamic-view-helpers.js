
import { getLanguage } from 'country-language';
import _ from 'lodash';
import s from 'underscore.string';
import config from '../config';
import moment from 'moment';

export default function dynamicViewHelpers(ctx, next) {

  // add csrf for forms, global, and meta tag
  ctx.state.csrf = ctx.csrf;

  // add lodash in case we need it
  ctx.state._ = _;

  // add underscore.string in case we need it
  ctx.state.s = s;

  // allow config to render in views (be careful)
  ctx.state.config = config;

  // add moment
  ctx.state.moment = moment;

  // add `user` object to the state for views
  if (ctx.isAuthenticated())
    ctx.state.user = ctx.req.user.toObject();

  // add `req` object to the state for views
  ctx.state.req = ctx.request;

  // add `query` object to the state for views
  ctx.state.query = ctx.query;

  // bind a `t` helper function for translations
  ctx.state.t = ctx.state.__;
  ctx.state.tn = ctx.state.__n;

  // available languages for a dropdown menu to change language
  ctx.state.languages = _.sortBy(_.map(config.locales, locale => {
    return {
      locale,
      name: getLanguage(locale).name
    };
  }), 'name');

  // get the name of the current locale's language
  ctx.state.currentLanguage = getLanguage(ctx.i18n.locale).name;

  // allow the locale to be read by the view
  // (useful for defining the `lang` attribute in `<html>`)
  ctx.state.locale = ctx.i18n.locale;

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
