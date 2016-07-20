
import co from 'co';
import _ from 'lodash';
import Boom from 'boom';
import config from '../config';

// initialize try/catch error handling right away
// adapted from: https://github.com/koajs/onerror/blob/master/index.js
// https://github.com/koajs/examples/issues/20#issuecomment-31568401
//
// inspired by:
// https://goo.gl/62oU7P
// https://goo.gl/8Z7aMe

export default async function errorHandler(err) {

  if (!err) return;

  console.log('errorHandler', err);

  this.status = this.statusCode = err.statusCode = err.status = err.status || 500;
  this.body = Boom.create(err.status, err.message).output.payload;

  this.app.emit('error', err, this);

  // nothing we can do here other
  // than delegate to the app-level
  // handler and log.
  if (this.headerSent || !this.writable) {
    err.headerSent = true;
    return;
  }

  const type = this.accepts(['text', 'json', 'html']);

  switch (type) {
    case 'html':
      this.type = 'html';
      if (this.status === 404) {
        // fix page title and desc for 404 page
        this.state = _.merge(this.state, config.meta['/404']);
        // https://github.com/koajs/koa/issues/646
        await this.render('404');
      } else if (this.get('Referrer') === '' || this.status === 500) {
        // prevent redirect loop
        // fix page title and desc for 500 page
        this.state = _.merge(this.state, config.meta['/500']);
        this.flash('error', err.message);
        await this.render('500');
      } else {
        this.flash('error', err.message);
        await co.wrap(this.sessionStore.set).call(this.sessionStore, this.sessionId, this.session);
        this.cookies.set(
          config.cookiesKey,
          this.sessionId,
          this.session.cookie
        );
        /*
        // if we're using `koa-session-store` we need to add
        // `this._session = new Session()`, and then run this:
        await co.wrap(this._session._store.save).call(
          this._session._store,
          this._session._sid,
          JSON.stringify(this.session)
        );
        this.cookies.set(this._session._name, JSON.stringify({
          _sid: this._session._sid
        }), this._session._cookieOpts);
        */
        this.redirect('back');
      }
      break;
    case 'json':
      this.type = 'json';
      this.body = JSON.stringify(this.body);
      break;
    default:
      this.type = 'text';
      this.body = JSON.stringify(this.body, null, 2);
      break;
  }

  this.length = Buffer.byteLength(this.body);
  this.res.end(this.body);

};
