// turn off max length eslint rule since this is a config file with long strs
/* eslint max-len: 0 */

// meta tags is an object of paths
// where each path is an array containing
//
// '/some/path': [ title, description ]
//
// note that you can include <span class="notranslate">
// if needed around certain text values in ordre to
// prevent Google Translate from translating them
// note that the helper named `meta` in `helpers/meta.js`
// will automatically remove HTML tags from the strings
// before returning them to be rendered in tags such as
// `<title>` and `<meta name="description">`
//
module.exports = function(config) {
  return {
    '/': [
      // currently we cannot use the `|` pipe character due to this issue
      // <https://github.com/mashpie/i18n-node/issues/274>
      // otherwise we'd have `| Lad` below, which is SEO standard
      // so instead we need to use `&#124;` which is the html entity
      // which gets decoded to a `|` in the helper.meta function
      `Home &#124; <span class="notranslate">${config.appName}</span>`,
      config.pkg.description
    ]
  };
};
