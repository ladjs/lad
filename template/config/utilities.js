const _ = require('lodash');
const ajc = require('array-join-conjunction');
const dashify = require('dashify');
const hljs = require('highlight.js');
const humanize = require('humanize-string');
const isBot = require('isbot');
const isSANB = require('is-string-and-not-blank');
const dayjs = require('dayjs');
const numeral = require('numeral');
const pluralize = require('pluralize');
const reservedEmailAddressesList = require('reserved-email-addresses-list');
const striptags = require('striptags');
const titleize = require('titleize');
const toEmoji = require('gemoji/name-to-emoji');
const validator = require('validator');
const { boolean } = require('boolean');

const json = (string, replacer = null, space = 2) =>
  JSON.stringify(string, replacer, space);

const emoji = (string) => (toEmoji[string] ? toEmoji[string] : '');

module.exports = {
  _,
  ajc,
  boolean,
  dashify,
  emoji,
  hljs,
  humanize,
  isBot,
  isSANB,
  json,
  dayjs,
  numeral,
  pluralize,
  reservedEmailAddressesList,
  striptags,
  titleize,
  validator
};
