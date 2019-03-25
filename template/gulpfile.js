const path = require('path');
const fs = require('fs-extra');
const awspublish = require('gulp-awspublish');
const babelify = require('@ladjs/babelify');
const cloudfront = require('gulp-cloudfront');
const lr = require('gulp-livereload');
const sourcemaps = require('gulp-sourcemaps');
const gulpif = require('gulp-if');
const xo = require('gulp-xo');
const eslint = require('gulp-eslint');
const { task, watch, series, parallel, src, dest } = require('gulp');
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

// don't stop streams/tasks if we're running watch
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
  return src(src).pipe(gulpif(reload && DEV, lr(config.livereload)));
};

function clean() {
  return fs.emptyDir(path.join(__dirname, 'build'));
}

function mkdirp() {
  return fs.emptyDir(path.join(__dirname, 'build', '.fonts'));
}

function publish() {
  // create a new publisher
  const publisher = awspublish.create(config.aws);
  return (
    src(['build/**/*', '!build/rev-manifest.json'])
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
}

function pug() {
  return pugTask();
}

function livereload() {
  return lr.listen(config.livereload);
}

// TODO: gulp-rev-all
// TODO: express-redirect-loop fix for koa
// TODO: rev images?
function img() {
  return src('assets/img/**/*', {
    base: 'assets'
  })
    .pipe(
      imagemin({
        progressive: true,
        svgoPlugins: [{ removeViewBox: false }, { cleanupIDs: false }],
        use: [pngquant()]
      })
    )
    .pipe(dest('build'))
    .pipe(gulpif(DEV, lr(config.livereload)))
    .pipe(
      gulpif(
        PROD,
        rev.manifest('build/rev-manifest.json', {
          base: 'build'
        })
      )
    )
    .pipe(gulpif(PROD, dest('build')));
}

function css() {
  return src('assets/css/**/*.scss', {
    base: 'assets'
  })
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss(processors))
    .pipe(reporter(reporterOptions))
    .pipe(gulpif(PROD, rev()))
    .pipe(sourcemaps.write('./'))
    .pipe(dest('build'))
    .pipe(gulpif(DEV, lr(config.livereload)))
    .pipe(
      gulpif(
        PROD,
        rev.manifest('build/rev-manifest.json', {
          merge: true,
          base: 'build'
        })
      )
    )
    .pipe(gulpif(PROD, dest('build')));
}

task('xo', () =>
  src('assets/**/*.js')
    .pipe(xo())
    .pipe(reporter(reporterOptions))
);

task('eslint', () =>
  src('build/**/*.js')
    .pipe(eslint())
    .pipe(reporter(reporterOptions))
);

function js(done) {
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
            .pipe(dest('build'))
            .pipe(gulpif(DEV, lr(config.livereload)))
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
          .pipe(dest('build'));

      taskStream.on('end', done);
    }
  );
}

function static() {
  return src(staticAssets, {
    base: 'assets',
    allowEmpty: true
  }).pipe(dest('build'));
}

task('browser', async () => {
  if (OPEN_BROWSER) await opn(config.urls.web, { wait: false });
});

const build = series(
  clean,
  mkdirp,
  parallel(img, static, 'xo', css),
  'eslint',
  'browser'
);

function watchFiles() {
  watch('assets/img/**/*', img);
  watch('assets/css/**/*.scss', css);
  watch('assets/js/**/*.js', js);
  watch('build/js/**/*.js', eslint);
  watch('app/views/**/*.pug', event => pugTask(true, [event.path]));
}

task('watch', series(parallel(livereload, build), watchFiles));

module.exports = {
  build,
  clean,
  css,
  img,
  js,
  livereload,
  mkdirp,
  publish,
  pug,
  static
};

exports.default = build;
