const url = require('url');
const _ = require('lodash');
const s = require('underscore.string');

//
// Since we support links containing `?return_to=/some/path`
//
// (e.g. if a user needs to log in to see content visible
// that is shown further down the page, we don't want to
// make them scroll down again, so we scroll down automatically
// after they have successfully logged in)
//
// we could do ?return_to=/some/path#some-anchor
// however this doesn't work due to server not receiving hash
// <http://stackoverflow.com/questions/317760/how-to-get-url-hash-from-server-side>
//
// they can't pick-up the hash tag server-side, so we pass it
// as a querystring parameter, therefore if there is a qs
// parameter of `hash=` then we must convert it to location
//
// For more information see function `registerOrLogin` in the auth controller
//
// <https://nodejs.org/api/url.html#url_url_format_urlobject>
//
module.exports = () => {
  const obj = url.parse(window.location.href, {
    parseQueryString: true
  });
  if (!_.isObject(obj.query) || !_.isString(obj.query.hash) || s.isBlank(obj.query.hash)) return;
  obj.hash = obj.query.hash;
  delete obj.query.hash;
  obj.search = undefined;
  window.location = url.format(obj);
};
