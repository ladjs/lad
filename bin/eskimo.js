#!/usr/bin/env node

//     eskimo
//     Copyright (c) 2014- Nick Baugh <niftylettuce@gmail.com> (http://niftylettuce.com)
//     MIT Licensed

// Eskimo lets you create and build an igloo

// * Author: [@niftylettuce](https://twitter.com/#!/niftylettuce)
// * Source: <https://github.com/niftylettuce/eskimo>

// # eskimo

var _ = require('underscore')
var _str = require('underscore.string')
_.mixin(_str.exports())

var pluralize = require('pluralize')
_.pluralize = pluralize.plural
_.singularize = pluralize.singular

var async = require('async')
var fs = require('fs')
var ncp = require('ncp')
var mkdirp = require('mkdirp')
var IoC = require('electrolyte')
var igloo = require('igloo')
var chalk = require('chalk')
var program = require('commander')
var path = require('path')
var pkg = require(path.join(__dirname, '..', 'package.json'))
var updateNotifier = require('update-notifier')
var util = require('util')
var Mixpanel = require('mixpanel')
var os = require('os')

var mixpanel = new Mixpanel.init('c09d7ee8744570287e5818650b9d657f')

var templates = path.join(__dirname, '..', 'templates')

var context = {
  type: os.type(),
  platform: os.platform(),
  arch: os.arch(),
  release: os.release(),
  uptime: os.uptime(),
  //loadavg: os.loadavg(),
  totalmem: os.totalmem(),
  freemem: os.freemem(),
  cpus: os.cpus().length
}

function track(event, properties) {
  mixpanel.track(event, _.defaults(properties, context))
}

program.version(pkg.version)

program.option('-N, --no-update-notifier', 'disable update notifier')
program.option('-T, --no-tracking', 'disable anonymous tracking')

program
  .command('create <dirname>')
  .description('create a new igloo')
  .action(create)

/*
program
  .command('build <dirname>')
  .description('build an existing igloo')
  .action(build)
*/

program
  .command('model <name>')
  .description('create a new model (singular)')
  .action(model)

program
  .command('view <name>')
  .description('create a new view (singular)')
  .action(view)
program
  .command('controller <name>')
  .description('create a new controller (singular)')
  .action(controller)

program
  .command('mvc <name>')
  .description('create a new model, view, and controller (singular)')
  .action(mvc)

program.parse(process.argv)

if (program.updateNotifier) {

  // check for updates to eskimo
  var notifier = updateNotifier({
    packageName: pkg.name,
    packageVersion: pkg.version
  })

  if (!_.isUndefined(notifier.update) && _.isString(notifier.update.latest)) {

    log(
      '%s released, run `npm install -g %s` to upgrade',
      notifier.update.latest,
      pkg.name
    )

    if (program.tracking)
      track('update', {
        pkg: pkg.name,
        current: pkg.version,
        latest: notifier.update.latest
      })

  }

}

function create(dirname) {

  log(
    'creating igloo: %s',
    path.resolve(dirname)
  )

  async.each([
    'gitignore',
    '.jshintrc',
    'routes.js',
    'app.js',
    'boot',
    'etc',
    'app',
    'assets'
  ], copy(dirname), function(err) {

    if (err) return log(err)

    // package.json
    var to = path.resolve(path.join(dirname, 'package.json'))

    pkg = _.omit(pkg, [
      'description',
      'bin',
      'repository',
      'author',
      'bugs',
      'license',
      'homepage'
    ])

    pkg.dependencies = _.omit(pkg.dependencies, [
      'commander',
      'async',
      'ncp',
      'mkdirp',
      'update-notifier',
      'mixpanel'
    ])

    // name
    pkg.name = path.basename(dirname).toLowerCase().replace(/\W/g, '-')
    // version
    pkg.version = '0.0.1'
    // main
    pkg.main = './app.js'
    // private
    pkg.private = true

    fs.writeFile(to, JSON.stringify(pkg, null, 2), function(err) {
      if (err) return log(err)
      log(
        'created package.json: %s',
        to
      )
      log(
        'created igloo: %s',
        path.resolve(dirname)
      )
      log(chalk.green.underline('do this:'))
      log(
        chalk.gray(util.format('cd %s', path.resolve(dirname))),
        chalk.gray('&&'),
        chalk.gray('npm install'),
        chalk.gray('&&'),
        chalk.gray('node app')
      )
    })

  })

  if (program.tracking)
    track('create', {
      path: path
    })
}

function copy(dirname) {
  return function(name, callback) {
    var from = path.join(__dirname, '..', name)
    var to = path.resolve(path.join(dirname, name === 'gitignore' ? '.gitignore' : name))
    log('from: %s', from)
    log('to: %s', to)
    fs.stat(from, function(err, stats) {
      if (err) return callback(err)
      // if it's not a folder than just copy the file
      if (!stats.isDirectory())
        return ncp(from, to, callback)
      // otherwise mkdirp then copy the folder
      mkdirp(to, function(err) {
        if (err) return callback(err)
        ncp(from, to, callback)
      })
    })
  }
}

function model(name) {

  name = _.singularize(name.toLowerCase())

  createTemplatedFile('models', name, function(err, fileName) {
    if (err) return log(err)
    log('Created model: %s', fileName)
  })

  if (program.tracking)
    track('model', {
      name: name
    })
}

function view(name) {

  name = _.singularize(name.toLowerCase())

  var viewDir = path.resolve(path.join('app', 'views', _.pluralize(_.dasherize(name))))

  mkdirp(viewDir, function(err) {
    if (err) return log(err)
    async.each([
      'edit',
      'index',
      'new',
      'show'
    ], function(file, callback) {
      var template = path.join(__dirname, '..', 'templates', 'views', file + '.jade')
      fs.readFile(template, 'utf8', function(err, data) {
        if (err) return callback(err)
        data = _.template(data, {
          name: name
        })
        var fileName = path.join(viewDir, file + '.jade')
        fs.writeFile(fileName, data, callback)
      })
    }, function(err) {
      if (err) return log(err)
      log('Created views: %s', viewDir)
    })
  })

  if (program.tracking)
    track('view', {
      name: name
    })
}

function controller(name) {

  name = _.singularize(name.toLowerCase())

  createTemplatedFile('controllers', name, function(err, fileName) {
    if (err) return log(err)
    log('Created controller: %s', fileName)
    log('Add the following to ./routes.js (above static server):')
    log()
    log("app.resource('%s', IoC.create('controllers/%s'), {", _.pluralize(_.dasherize(name)), _.pluralize(_.dasherize(name)))
    log("  id: '%s'", _.underscored(name))
    log("})")
    log()
  })
  if (program.tracking)
    track('controller', {
      name: name
    })
}

function mvc(name) {
  model(name)
  view(name)
  controller(name)
  if (program.tracking)
    track('mvc', {
      name: name
    })
}

function createTemplatedFile(template, name, callback) {
  fs.readFile(path.join(templates, template + '.js'), 'utf8', function(err, data) {
    if (err) return callback(err)
    data = _.template(data, {
      name: name
    })
    var fileName = ''
    if (template === 'controllers')
      fileName = path.resolve(path.join('app', template, _.dasherize(_.pluralize(name)) + '.js'))
    else
      fileName = path.resolve(path.join('app', template, _.dasherize(name) + '.js'))
    fs.writeFile(fileName, data, function(err) {
      if (err) return callback(err)
      callback(null, fileName)
    })
  })
}

function log() {
  var str = util.format.apply(util.format, _.flatten(arguments))
  str = chalk.cyan('eskimo: ') + str
  console.log(str)
}
