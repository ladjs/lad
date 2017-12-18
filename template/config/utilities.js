const hljs = require('highlight.js');
const _ = require('lodash');
const s = require('underscore.string');
const moment = require('moment');
const accounting = require('accounting');
const fa = require('font-awesome-assets');
const pluralize = require('pluralize');
const customFonts = require('custom-fonts-in-emails');
const gemoji = require('gemoji');
const boolean = require('boolean');

function json(str, replacer = null, space = 2) {
  return JSON.stringify(str, replacer, space);
}

function emoji(str) {
  return gemoji.name[str] ? gemoji.name[str].emoji : '';
}

module.exports = {
  hljs,
  _,
  s,
  moment,
  accounting,
  fa,
  pluralize,
  json,
  emoji,
  boolean,
  ...customFonts
};
