
// # gulpfile

var gulp = require('gulp')
var mocha = require('gulp-mocha')
var jshint = require('gulp-jshint')
var stylish = require('jshint-stylish')
var exit = require('gulp-exit')

var tests = 'test/**/*.test.js'
var scripts = [
  'app/**/*.js',
  'assets/public/**/*.js',
  '!assets/public/js/vendor/**/*.js',
  'bin/eskimo.js',
  'boot/**/*.js',
  'etc/**/*.js'
]

gulp.task('test', [ 'jshint', 'mocha' ])

gulp.task('mocha', function() {
  gulp
    .src(tests)
    .pipe(
      mocha(
        {
          reporter: 'dot',
          ui: 'bdd',
          growl: true,
          timeout: 2000,
          useColors: true,
          useInlineDiffs: true
        }
      )
    )
    .pipe(exit())
})

gulp.task('jshint', function() {
  gulp
    .src(scripts)
    .pipe(jshint())
    .pipe(jshint.reporter(stylish))
})

