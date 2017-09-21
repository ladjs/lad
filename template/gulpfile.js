const puglint = require('gulp-pug-lint');
const gutil = require('gulp-util');
const awspublish = require('gulp-awspublish');
const babelify = require('babelify');
const cloudfront = require('gulp-cloudfront');
const runSequence = require('run-sequence');
const livereload = require('gulp-livereload');
const sourcemaps = require('gulp-sourcemaps');
const gulpif = require('gulp-if');
const xo = require('gulp-xo');
const gulp = require('gulp');
const source = require('vinyl-source-stream');
const uglify = require('gulp-uglify');
const browserify = require('browserify');
const buffer = require('vinyl-buffer');
const rev = require('gulp-rev');
const glob = require('glob');
const es = require('event-stream');
const imagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');
const postcss = require('gulp-postcss');
const sass = require('gulp-sass');
const cssnano = require('cssnano');
const autoprefixer = require('autoprefixer');
const reporter = require('postcss-reporter');
const swagger = require('gulp-swagger-js-codegen');
const ms = require('ms');
const opn = require('opn');

const config = require('./config');

// create a new publisher
const publisher = awspublish.create(config.aws);

// define custom headers
const headers = {
  'Cache-Control': `public, max-age=${ms('1yr')}`
};

const PROD = config.env === 'production';

const processors = [
  reporter({
    clearMessages: true
  }),
  autoprefixer()
];

if (PROD) processors.push(cssnano());

const staticAssets = [
  'assets/browserconfig.xml',
  'assets/favicon.ico',
  'assets/manifest.json',
  'assets/fonts/**/*'
];

gulp.task('default', ['build']);

gulp.task('build', done => {
  // TODO: add `rimraf dist`
  // TODO: add remark-cli with -qfo options
  // TODO: ensure depcheck, xo, pug-lint, remark lint called in lint task
  runSequence('lint', 'css', ['img', 'js', 'static'], async () => {
    if (config.env === 'development') {
      if (config.openInBrowser) {
        await opn(config.urls.web, { wait: false });
      }
      done();
    }
  });
});

gulp.task('publish', () => {
  return (
    gulp
      .src(['build/**/*', '!build/rev-manifest.json'])
      // gzip, Set Content-Encoding headers and add .gz extension
      .pipe(awspublish.gzip())
      // publisher will add Content-Length, Content-Type
      // and headers specified above
      // If not specified it will set x-amz-acl to public-read by default
      .pipe(publisher.publish(headers))
      // create a cache file to speed up consecutive uploads
      .pipe(publisher.cache())
      // print upload updates to console
      .pipe(awspublish.reporter())
      .pipe(cloudfront(config.aws))
  );
});

gulp.task('pug', () => {
  return gulp
    .src(['app/views/**/*.pug', 'emails/**/*.pug'])
    .pipe(puglint())
    .pipe(gulpif(!PROD, livereload(config.livereload)));
});

gulp.task('watch', ['build'], () => {
  livereload.listen(config.livereload);
  gulp.watch('assets/img/**/*', ['img']);
  gulp.watch('assets/css/**/*.scss', ['css']);
  gulp.watch('assets/js/**/*.js', ['js']);
  gulp.watch('app/views/**/*.pug', ['pug']);
});

gulp.task('img', () => {
  return gulp
    .src('assets/img/**/*', {
      base: 'assets'
    })
    .pipe(
      imagemin({
        progressive: true,
        svgoPlugins: [{ removeViewBox: false }, { cleanupIDs: false }],
        use: [pngquant()]
      })
    )
    .pipe(gulp.dest('build'))
    .pipe(gulpif(!PROD, livereload(config.livereload)))
    .pipe(
      gulpif(
        PROD,
        rev.manifest('build/rev-manifest.json', {
          base: 'build'
        })
      )
    )
    .pipe(gulpif(PROD, gulp.dest('build')));
});

gulp.task('css', () => {
  return gulp
    .src('assets/css/**/*.scss', {
      base: 'assets'
    })
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss(processors))
    .pipe(gulpif(PROD, rev()))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('build'))
    .pipe(gulpif(!PROD, livereload(config.livereload)))
    .pipe(
      gulpif(
        PROD,
        rev.manifest('build/rev-manifest.json', {
          merge: true,
          base: 'build'
        })
      )
    )
    .pipe(gulpif(PROD, gulp.dest('build')));
});

gulp.task('lint', () => {
  return gulp
    .src('assets/js/**/*.js')
    .pipe(xo())
    .pipe(xo.format())
    .pipe(xo.failAfterError());
});

gulp.task('js', ['lint'], done => {
  glob(
    'js/**/*.js',
    {
      cwd: 'assets'
    },
    (err, files) => {
      if (err) return done(err);

      const tasks = files.map(entry => {
        return browserify({
          entries: entry,
          debug: false,
          basedir: 'assets'
        })
          .transform(babelify)
          .bundle()
          .on('error', function(err) {
            console.log('err', err);
            console.log('oh knoez!');
            gutil.log(err.message);
            this.emit('end');
          })
          .pipe(source(entry))
          .pipe(buffer())
          .pipe(
            sourcemaps.init({
              // loads map from browserify file
              loadMaps: true
            })
          )
          .pipe(gulpif(PROD, uglify()))
          .pipe(gulpif(PROD, rev()))
          .pipe(sourcemaps.write('./'))
          .pipe(gulp.dest('build'))
          .pipe(gulpif(!PROD, livereload(config.livereload)));
      });

      const taskStream = es.merge(tasks);

      if (PROD)
        taskStream
          .pipe(
            rev.manifest('build/rev-manifest.json', {
              merge: true,
              base: 'build'
            })
          )
          .pipe(gulp.dest('build'));

      taskStream.on('end', done);
    }
  );
});

gulp.task('static', () => {
  return gulp
    .src(staticAssets, {
      base: 'assets'
    })
    .pipe(gulp.dest('build'));
});

gulp.task('swagger', () => {
  return gulp
    .src('swagger-api.yaml')
    .pipe(
      swagger({
        type: 'node',
        swaggerOptions: {
          lint: false,
          className: 'Lad'
        }
      })
    )
    .pipe(gulp.dest('build'));
});
