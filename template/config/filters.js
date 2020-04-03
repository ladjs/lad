const isSANB = require('is-string-and-not-blank');
const markdownIt = require('markdown-it');
const markdownItEmoji = require('markdown-it-emoji');
const markdownItGitHubHeadings = require('markdown-it-github-headings');
const markdownItHighlightJS = require('markdown-it-highlightjs');
const markdownItTaskCheckbox = require('markdown-it-task-checkbox');

const i18n = require('../helpers/i18n');

// <https://github.com/markdown-it/markdown-it>
// <https://github.com/valeriangalliat/markdown-it-highlightjs>
// <https://github.com/jstransformers/jstransformer-markdown-it/issues/7#issuecomment-168945445>
// <https://github.com/shime/livedown>
const markdown = markdownIt({
  html: true,
  linkify: true
});
markdown.use(markdownItHighlightJS);
markdown.use(markdownItTaskCheckbox);
markdown.use(markdownItEmoji);
markdown.use(markdownItGitHubHeadings, {
  prefix: ''
});

module.exports = {
  md: (string, options) => {
    if (!isSANB(options.locale))
      return `<div class="markdown-body">${markdown.render(string)}</div>`;
    return `<div class="markdown-body">${i18n.api.t({
      phrase: markdown.render(string),
      locale: options.locale
    })}</div>`;
  }
};
