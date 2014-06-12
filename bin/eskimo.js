#!/usr/bin/env node

// # eskimo

var _ = require('underscore')
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
  .description('create a new model')
  .action(model)

program
  .command('view <name>')
  .description('create a new view')
  .action(view)
program
  .command('controller <name>')
  .description('create a new controller')
  .action(controller)

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
    path.resolve(path.join(__dirname, '..'), dirname)
  )

  async.each([
    '._gitignore',
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
    var to = path.resolve(__dirname, dirname, 'package.json')

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
        path.resolve(__dirname, dirname)
      )
      log(chalk.green.underline('do this:'))
      log(
        chalk.gray(util.format('cd %s', path.resolve(path.join(__dirname, '..'), dirname))),
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
    var to = path.resolve(__dirname, dirname, name === '._gitignore' ? '.gitignore' : name)
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

/*
function build(file) {

  var app = path.resolve(__dirname, file)

  if (program.tracking)
    track('build', {
      file: file
    })

  require(app)

}
*/

function model(name) {
  log('coming soon')
  if (program.tracking)
    track('model', {
      name: name
    })
}

function view(name) {
  log('coming soon')
  if (program.tracking)
    track('view', {
      name: name
    })
}

function controller(name) {
  log('coming soon')
  if (program.tracking)
    track('controller', {
      name: name
    })
}

function log() {
  var str = util.format.apply(util.format, _.flatten(arguments))
  str = chalk.cyan('eskimo: ') + str
  console.log(str)
}
