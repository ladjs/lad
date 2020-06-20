const I18N = require('@ladjs/i18n');
const isSANB = require('is-string-and-not-blank');

const i18nConfig = require('../config/i18n');
const logger = require('../helpers/logger');
const markdown = require('../helpers/markdown');

module.exports = {
  md: (string, options) => {
    if (!isSANB(options.locale))
      return `<div class="markdown-body">${markdown.render(string)}</div>`;
    //
    // NOTE: we want our own instance of i18n that does not auto reload files
    //
    const i18n = new I18N({
      ...i18nConfig,
      autoReload: false,
      updateFiles: false,
      syncFiles: false,
      logger
    });
    return `<div class="markdown-body">${i18n.api.t({
      phrase: markdown.render(string),
      locale: options.locale
    })}</div>`;
  }
};
