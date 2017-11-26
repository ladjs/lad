#!/usr/bin/env node
const proxy = require('@ladjs/proxy');

if (!module.parent) proxy.listen(80);
module.exports = proxy;
