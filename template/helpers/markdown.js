const markdownIt = require('markdown-it');
const markdownItEmoji = require('markdown-it-emoji');
const markdownItGitHubHeadings = require('markdown-it-github-headings');
const markdownItHighlightJS = require('markdown-it-highlightjs');
const markdownItTaskCheckbox = require('markdown-it-task-checkbox');

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

module.exports = markdown;
