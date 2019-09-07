const _ = require('lodash');
const rc = require('rc');

const eslint = rc('build.eslint');

const polyfills = _.uniq([
  // We polyfill an es6 and es7 environment due to methods such as
  // String.prototype.includes not being linted nor polyfilled by default
  'es6',
  'es7',
  // <https://github.com/amilajack/eslint-plugin-compat/issues/168#issuecomment-502839983>
  'Element',
  'Element.prototype.append',
  'Element.prototype.prepend',
  'Element.prototype.replaceWith',
  'Element.prototype.after',
  'Element.prototype.before',
  'Element.prototype.cloneNode',
  'Element.prototype.classList',
  'Element.prototype.matches',
  'Element.prototype.dataset',
  'Element.prototype.closest',
  'Element.prototype.placeholder',
  'Element.prototype.remove',
  'Element.prototype.toggleAttribute',
  //
  // since compat/compact reports "window" prefixed feature names
  // we need to drop the "window" as the polyfill-service does not support it
  // <https://github.com/Financial-Times/polyfill-service/issues/1970>
  //
  ...eslint.settings.polyfills.map(str => str.replace(/^window./i, ''))
]);

module.exports = polyfills;
