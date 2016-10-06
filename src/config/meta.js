
// meta tags is an object of paths
// where each path is an array containing
//
// '/some/path': [ title, description ]
//
// note that you can include <span class="notranslate">
// if needed around certain text values in ordre to
// prevent Google Translate from translating them
// note that the helper named `meta` in `src/helpers/meta.js`
// will automatically remove HTML tags from the strings
// before returning them to be rendered in tags such as
// `<title>` and `<meta name="description">`
//
export default {
  '/': [
    // currently we cannot use the `|` pipe character due to this issue
    // <https://github.com/mashpie/i18n-node/issues/274>
    // otherwise we'd have `| CrocodileJS` below, which is SEO standard
    'Node JS MVC Koa Framework - CrocodileJS',
    "Multilingual full-stack Node.js + Koa + ES7 + MVC framework for Apps and API's."
  ]
};
