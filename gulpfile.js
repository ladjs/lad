
// # gulpfile

var gulp = require('gulp');
var csso = require('gulp-csso');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var exit = require('gulp-exit');
var bower = require('gulp-bower');
var less = require('gulp-less');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var path = require('path');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var del = require('del');
var runSequence = require('run-sequence');
var usemin = require('gulp-jade-usemin');
var uglify = require('gulp-uglify');
var minifyHtml = require('gulp-minify-html');
var rev = require('gulp-rev');
var revall = require('gulp-rev-all');
var through = require('through2');
var override = require('gulp-rev-css-url');
var filter = require('gulp-filter');
var livereload = require('tiny-lr')();
//var bowerJSON = require('./bower.json');
//var googlecdn = require('gulp-google-cdn');

// load dependencies
var IoC = require('electrolyte');
IoC.loader(IoC.node(path.join(__dirname, 'boot')));
IoC.loader('igloo', require('igloo'));
var logger = IoC.create('igloo/logger');
var settings = IoC.create('igloo/settings');

// load scripts to lint
var scripts = [
  './app/**/*.js',
  './assets/public/**/*.js',
  '!./assets/public/bower/**/*.js',
  './bin/eskimo.js',
  './boot/**/*.js',
  './etc/**/*.js',
  './test/**/.js',
  './*.js'
];

gulp.task('postinstall', function(callback) {
  runSequence(
    'bower',
    'font-awesome',
    'less',
    'jshint',
    callback
  );
});

gulp.task('jshint', function() {
  return gulp
    .src(scripts)
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));
});

gulp.task('less', function() {
  return gulp
    .src([
      './assets/public/css/style.less'
    ])
    .pipe(less().on('error', function(err) {
      logger.error(err);
    }))
    .pipe(sourcemaps.write('./maps'))
    .pipe(gulp.dest('./assets/public/css'));
});

// Helper to have gulp tasks notify livereload
function notifyLiveReload(event) {
  if (!event || !event.path)
    return false;
  var fileName = path.relative(settings.publicDir, event.path);
  livereload.changed({
    body: {
      files: [fileName]
    }
  });
}

gulp.task('watch', [ 'watch-noreload' ], function() {
  livereload.listen(settings.liveReload.port);
  gulp.watch([
    './assets/public/**/*',
    '!./assets/public/**/*.less'
  ], notifyLiveReload);
});

gulp.task('watch-noreload', function() {
  gulp.watch('./assets/public/bower/**/*', [ 'bower' ]);
  gulp.watch('./assets/public/css/**/*.less', [ 'less' ]);
});

gulp.task('bower', function() {
  return bower({
    directory: './assets/public/bower'
  }).pipe(gulp.dest('./assets/dist/bower'));
});

gulp.task('font-awesome', function() {
  return gulp
    .src('./assets/public/bower/font-awesome/fonts/**/*')
    .pipe(gulp.dest('./assets/public/fonts/font-awesome'));
});

gulp.task('clean', function() {
  return del([
    './assets/dist',
    './bower_components',
    './assets/public/fonts/font-awesome'
  ], {
    force: true
  });
});

gulp.task('imagemin', function () {
  return gulp
    .src('./assets/public/img/**/*')
    .pipe(revall({
      //prefix: 'http://cdn.cloudfront.net/'
    }))
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [ { removeViewBox: false } ],
      use: [ pngquant() ]
    }))
    .pipe(gulp.dest('./assets/dist/img/'));
});

gulp.task('copy', function() {
  return gulp.src([
      './assets/public/favicon.ico',
      './assets/public/favicon.png',
      './assets/public/robots.txt',
      './assets/public/crossdomain.xml',
      './assets/public/apple-touch-icon-precomposed.png'
    ])
    .pipe(gulp.dest('./assets/dist/'));
});

gulp.task('copy-images', function() {
  return gulp
    .src('./assets/public/img/**/*')
    .pipe(gulp.dest('./assets/dist/img/'));
});

gulp.task('usemin-js', function() {
  return gulp
    .src([
      'assets/public/js/**/*.js'
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
    .pipe(through.obj(function(file, enc, cb) {
      file.path = file.revOrigPath;
      cb(null, file);
    }))
    .pipe(gulp.dest('./assets/dist/js'));
});

gulp.task('usemin-css', function() {
  // create an accurate version of css with
  // images that have rev md5 hashes
  // and css that has updated image/font paths

  var imageFilter = filter('**/*.{jpg,jpeg,gif,png}');
  var fontFilter = filter('**/*.{eot,svg,ttf,woff}');
  var cssFilter = filter('**/*.css');

  return gulp
    .src([
      'assets/public/img/**/*.{jpg,jpeg,gif,png}',
      'assets/public/fonts/**/*.{eot,svg,ttf,woff}',
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
      use: [ pngquant() ]
    }))
    .pipe(gulp.dest('./assets/dist/img'))
    .pipe(imageFilter.restore())
    .pipe(fontFilter)
    .pipe(gulp.dest('./assets/dist/fonts'))
    .pipe(fontFilter.restore())
    .pipe(cssFilter)
    .pipe(through.obj(function(file, enc, cb) {
      file.path = file.revOrigPath;
      cb(null, file);
    }))
    .pipe(gulp.dest('./assets/dist/css'))
    .pipe(cssFilter.restore());
});

gulp.task('usemin-jade', function() {
  // create a dir full of jade, css, js files
  // that will be used in production in place
  // of the current app/views folder
  return gulp
    .src('./app/views/**/*.jade')
    .pipe(usemin({
      assetsDir: path.join(settings.assetsDir, 'dist'),
      css: [ csso(), 'concat', rev() ],
      html: [ minifyHtml({empty: true}), 'concat', rev() ],
      js: [ uglify(), 'concat', rev() ]
    }))
    /*
    .pipe(googlecdn(bowerJSON, {
      componentsPath: 'bower',
      cdn: require('cdnjs-cdn-data')
    }))
    */
    .pipe(gulp.dest('./assets/dist'));
});

gulp.task('build', function(callback) {
  runSequence(
    'clean',
    'postinstall',
    'copy',
    'copy-images',
    'imagemin',
    'usemin-css',
    'usemin-js',
    'usemin-jade',
    callback
  );
});

gulp.task('default', [ 'build' ]);
