const _ = require('lodash');
const accounting = require('accounting');
const dashify = require('dashify');
const fa = require('font-awesome-assets');
const gemoji = require('gemoji');
const hljs = require('highlight.js');
const humanize = require('humanize-string');
const isSANB = require('is-string-and-not-blank');
const moment = require('moment');
const pluralize = require('pluralize');
const titleize = require('titleize');
const { boolean } = require('boolean');

const json = (str, replacer = null, space = 2) =>
  JSON.stringify(str, replacer, space);
const emoji = str => (gemoji.name[str] ? gemoji.name[str].emoji : '');

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
  humanize
};
