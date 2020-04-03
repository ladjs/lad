const _ = require('lodash');
const accounting = require('accounting');
const ajc = require('array-join-conjunction');
const dashify = require('dashify');
const fa = require('font-awesome-assets');
const hljs = require('highlight.js');
const humanize = require('humanize-string');
const isSANB = require('is-string-and-not-blank');
const moment = require('moment');
const pluralize = require('pluralize');
const titleize = require('titleize');
const toEmoji = require('gemoji/name-to-emoji');
const validator = require('validator');
const { boolean } = require('boolean');

const json = (string, replacer = null, space = 2) =>
  JSON.stringify(string, replacer, space);

const emoji = string => (toEmoji[string] ? toEmoji[string] : '');

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
  validator,
  ajc
};
