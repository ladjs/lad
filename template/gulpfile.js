const path = require('path');
const fs = require('fs-extra');
const awspublish = require('gulp-awspublish');
const babelify = require('@ladjs/babelify');
const cloudfront = require('gulp-cloudfront');
const runSequence = require('run-sequence');
const livereload = require('gulp-livereload');
const sourcemaps = require('gulp-sourcemaps');
const gulpif = require('gulp-if');
const xo = require('gulp-xo');
const eslint = require('gulp-eslint');
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
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const cssnano = require('cssnano');
const cssnext = require('postcss-cssnext');
const ms = require('ms');
const opn = require('opn');
const reporter = require('gulp-reporter');
const boolean = require('boolean');
const fontMagician = require('postcss-font-magician');
// const { postcssFontGrabber } = require('postcss-font-grabber');
const inlineBase64 = require('postcss-inline-base64');
const sassyImport = require('postcss-sassy-import');
const mqPacker = require('css-mqpacker');
const unprefix = require('postcss-unprefix');

const { logger } = require('./helpers');
const config = require('./config');

const PROD = config.env === 'production';
const DEV = config.env === 'development';
const WATCH = boolean(process.env.WATCH);
const OPEN_BROWSER = boolean(process.env.OPEN_BROWSER);

// don't stop streams/tasks if we're running gulp watch
const reporterOptions = {};
if (WATCH) reporterOptions.fail = false;

// setup postcss processors
const processors = [
  sassyImport(),
  fontMagician({
    protocol: 'https:',
    formats: 'woff',
    hosted: [path.join(__dirname, 'build', 'fonts'), '/fonts']
  }),
  // postcssFontGrabber({ dirPath: path.join(__dirname, 'build', '.fonts') }),
  inlineBase64({ baseDir: path.join(__dirname, 'assets', 'css') }),
  unprefix(),
  mqPacker(),
  cssnext()
];
if (PROD) processors.push(cssnano({ autoprefixer: false }));

const staticAssets = [
  'assets/browserconfig.xml',
  'assets/favicon.ico',
  'assets/manifest.json',
  'assets/fonts/**/*'
];

const pugTask = (reload = false, src = ['app/views/**/*.pug']) => {
  return gulp.src(src).pipe(gulpif(reload && DEV, livereload(config.livereload)));
};

gulp.task('default', ['build']);

gulp.task('clean', () => {
  return fs.emptyDir(path.join(__dirname, 'build'));
});

gulp.task('mkdirp', () => {
  return fs.emptyDir(path.join(__dirname, 'build', '.fonts'));
});

gulp.task('build', done => {
  runSequence('clean', 'mkdirp', ['img', 'static', 'xo', 'css'], 'js', 'eslint', async () => {
    if (OPEN_BROWSER) await opn(config.urls.web, { wait: false });
    done();
  });
});

gulp.task('publish', () => {
  // create a new publisher
  const publisher = awspublish.create(config.aws);
  return (
    gulp
      .src(['build/**/*', '!build/rev-manifest.json'])
      // gzip, Set Content-Encoding headers and add .gz extension
      .pipe(awspublish.gzip())
      // publisher will add Content-Length, Content-Type
      // and headers specified below
      // If not specified it will set x-amz-acl to public-read by default
      .pipe(
        publisher.publish({
          'Cache-Control': `public, max-age=${ms('1yr')}`
        })
      )
      // create a cache file to speed up consecutive uploads
      .pipe(publisher.cache())
      // print upload updates to console
      .pipe(awspublish.reporter())
      .pipe(cloudfront(config.aws))
  );
});

gulp.task('pug', () => pugTask());

gulp.task('livereload', () => livereload.listen(config.livereload));

gulp.task('watch', ['livereload', 'build'], () => {
  gulp.watch('assets/img/**/*', ['img']);
  gulp.watch('assets/css/**/*.scss', ['css']);
  gulp.watch('assets/js/**/*.js', ['js']);
  gulp.watch('build/js/**/*.js', ['eslint']);
  gulp.watch('app/views/**/*.pug', event => pugTask(true, [event.path]));
});

// TODO: gulp-rev-all
// TODO: express-redirect-loop fix for koa
// TODO: rev images?
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
    .pipe(gulpif(DEV, livereload(config.livereload)))
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
    .pipe(reporter(reporterOptions))
    .pipe(gulpif(PROD, rev()))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('build'))
    .pipe(gulpif(DEV, livereload(config.livereload)))
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

gulp.task('xo', () => {
  return gulp
    .src('assets/**/*.js')
    .pipe(xo())
    .pipe(reporter(reporterOptions));
});

gulp.task('eslint', () => {
  return gulp
    .src('build/**/*.js')
    .pipe(eslint())
    .pipe(reporter(reporterOptions));
});

gulp.task('js', done => {
  glob(
    'js/**/*.js',
    {
      cwd: 'assets'
    },
    (err, files) => {
      if (err) return done(err);

      const tasks = files.map(entry => {
        return (
          browserify({
            entries: entry,
            debug: false,
            basedir: 'assets'
          })
            // TODO: redo all this like elsewhere (e.g. use gulp-babel@8.x)
            .transform(babelify)
            .bundle()
            .on('error', function(err) {
              logger.error(err);
              this.emit('end');
            })
            .pipe(source(entry))
            .pipe(buffer())
            .pipe(sourcemaps.init({ loadMaps: true }))
            .pipe(gulpif(PROD, uglify()))
            .pipe(gulpif(PROD, rev()))
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest('build'))
            .pipe(gulpif(DEV, livereload(config.livereload)))
        );
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
