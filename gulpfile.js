
// # gulpfile

var gulp = require('gulp')
var csso = require('gulp-csso')
var mocha = require('gulp-mocha')
var jshint = require('gulp-jshint')
var stylish = require('jshint-stylish')
var exit = require('gulp-exit')
var bower = require('gulp-bower')
var less = require('gulp-less')
var uglify = require('gulp-uglify')
var sourcemaps = require('gulp-sourcemaps')
var path = require('path')
//var watch = require('gulp-watch')
var imagemin = require('gulp-imagemin')
var pngcrush = require('imagemin-pngcrush')
var del = require('del')
var runSequence = require('run-sequence')
var usemin = require('gulp-jade-usemin');
var uglify = require('gulp-uglify');
var minifyHtml = require('gulp-minify-html');
var rev = require('gulp-rev');
var revall = require('gulp-rev-all')
var through = require('through2')
var override = require('gulp-rev-css-url')
var filter = require('gulp-filter')
var imageFilter = filter('**/*.{jpg,jpeg,gif,png}')
var fontFilter = filter('**/*.{eot,svg,ttf,woff}')
var cssAndJsFilter = filter([
  '**/*.css',
  '**/*.js'
])
var cssFilter = filter('**/*.css')
var jsFilter = filter('**/*.js')
//var bowerJSON = require('./bower.json')
//var googlecdn = require('gulp-google-cdn')

// load dependencies
var IoC = require('electrolyte')
IoC.loader(IoC.node(path.join(__dirname, 'boot')))
IoC.loader('igloo', require('igloo'))
var logger = IoC.create('igloo/logger')
var settings = IoC.create('igloo/settings')

// load tests
var tests = 'test/**/*.test.js'

// load scripts to lint
var scripts = [
  './app/**/*.js',
  './assets/public/**/*.js',
  './bin/eskimo.js',
  './boot/**/*.js',
  './etc/**/*.js'
]

gulp.task('test', [ 'jshint', 'mocha' ])

gulp.task('mocha', function() {
  return gulp
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
  return gulp
    .src(scripts)
    .pipe(jshint())
    .pipe(jshint.reporter(stylish))
})

gulp.task('less', function() {
  return gulp
    .src([
      './assets/public/css/bootstrap.less'
    ])
    .pipe(less().on('error', logger.error))
    .pipe(sourcemaps.write('./maps'))
    .pipe(gulp.dest('./assets/public/css'))
})

gulp.task('watch', function() {
  return gulp
    .watch('./assets/public/css/**/*.less', [ 'less' ])
  /*
  return watch({
    glob: '/path/to/some/less/files/*.less'
  }, function(files) {
    return files
      .pipe(less().on('error', logger.error))
      .pipe(sourcemaps.write('./maps'))
      .pipe(gulp.dest('assets/public/css'))
  })
  */
})

gulp.task('bower', function() {
  return bower({
    force: true,
    directory: './assets/public/bower'
  }).pipe(gulp.dest('./assets/dist/bower'))
})

gulp.task('clean', function() {
  return del([
    './assets/dist',
    './bower_components'
  ], {
    force: true
  })
})

gulp.task('imagemin', function () {
  return gulp
    .src('./assets/public/img/**/*')
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [ { removeViewBox: false } ],
      use: [ pngcrush() ]
    }))
    .pipe(gulp.dest('./assets/dist/img/'))
})

gulp.task('copy', function() {
  return gulp.src([
      './assets/public/favicon.ico',
      './assets/public/favicon.png',
      './assets/public/robots.txt',
      './assets/public/crossdomain.xml',
      './assets/public/apple-touch-icon-precomposed.png',
    ])
    .pipe(gulp.dest('./assets/dist/'))
})

gulp.task('usemin-css', function() {

  // create an accurate version of css with
  // images that have rev md5 hashes
  // and css that has updated image/font paths
  return gulp
    .src([
      'assets/public/img/**/*.{jpg,jpeg,gif,png}',
      'assets/public/fonts/**/*.{eot,svg,ttf,woff}',
      'assets/public/js/**/*.js',
      'assets/public/css/**/*.css'
    ])
    .pipe(revall({
      //prefix: 'http://cdn.cloudfront.net/'
    }))
    /*
    .pipe(googlecdn(bowerJSON, {
      componentsPath: 'bower',
      cdn: require('cdnjs-cdn-data')
    }))
    */
    .pipe(imageFilter)
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [ { removeViewBox: false } ],
      use: [ pngcrush() ]
    }))
    .pipe(gulp.dest('./assets/dist/img'))
    .pipe(imageFilter.restore())
    .pipe(fontFilter)
    .pipe(gulp.dest('./assets/dist/fonts'))
    .pipe(fontFilter.restore())
    //.pipe(override()) // no need to do this since we use relative paths
    .pipe(cssAndJsFilter)
    .pipe(through.obj(function(file, enc, cb) {
      file.path = file.revOrigPath
      cb(null, file)
    }))
    .pipe(cssAndJsFilter.restore())
    .pipe(cssFilter)
    .pipe(gulp.dest('./assets/dist/css'))
    .pipe(cssFilter.restore())
    .pipe(jsFilter)
    .pipe(gulp.dest('./assets/dist/js'))
})

gulp.task('usemin-jade', function() {

  // create a dir full of jade, css, js files
  // that will be used in production in place
  // of the current app/views folder
  return gulp
    .src('./app/views/**/*.jade')
    .pipe(usemin({
      assetsDir: path.join(settings.assetsDir, 'dist'),
      css: [csso(), 'concat', rev() ],
      html: [minifyHtml({empty: true}), 'concat', rev() ],
      js: [ uglify(), 'concat', rev() ]
    }))
    /*
    .pipe(googlecdn(bowerJSON, {
      componentsPath: 'bower',
      cdn: require('cdnjs-cdn-data')
    }))
    */
    .pipe(gulp.dest('./assets/dist'))

})


gulp.task('build', function(callback) {
  runSequence(
    'clean',
    'bower',
    'less',
    'copy',
    'imagemin',
    'usemin-css',
    'usemin-jade'
  , callback)
})
