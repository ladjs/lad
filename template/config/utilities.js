const _ = require('lodash');
const accounting = require('accounting');
const boolean = require('boolean');
const customFonts = require('custom-fonts-in-emails');
const dashify = require('dashify');
const fa = require('font-awesome-assets');
const gemoji = require('gemoji');
const hljs = require('highlight.js');
const humanize = require('humanize-string');
const isSANB = require('is-string-and-not-blank');
const moment = require('moment');
const pluralize = require('pluralize');
const titleize = require('titleize');

function json(str, replacer = null, space = 2) {
  return JSON.stringify(str, replacer, space);
}

function emoji(str) {
  return gemoji.name[str] ? gemoji.name[str].emoji : '';
}

module.exports = {
  hljs,
  _,
  isSANB,
  moment,
  accounting,
  fa,
  pluralize,
  json,
  emoji,
  boolean,
  titleize,
  dashify,
  humanize,
  ...customFonts
};
