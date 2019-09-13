const path = require('path');

const awspublish = require('gulp-awspublish');
const babelify = require('@ladjs/babelify');
const browserify = require('browserify');
const buffer = require('vinyl-buffer');
const cloudfront = require('gulp-cloudfront');
const collapser = require('bundle-collapser/plugin');
const commonShake = require('common-shakeify');
const cssnano = require('cssnano');
const del = require('del');
const envify = require('envify/custom');
const fontMagician = require('postcss-font-magician');
const fontSmoothing = require('postcss-font-smoothing');
const gulpEslint = require('gulp-eslint');
const gulpRemark = require('gulp-remark');
const gulpXo = require('gulp-xo');
const gulpif = require('gulp-if');
const imagemin = require('gulp-imagemin');
const lr = require('gulp-livereload');
const ms = require('ms');
const nodeSass = require('node-sass');
const pngquant = require('imagemin-pngquant');
const postcss = require('gulp-postcss');
const postcssPresetEnv = require('postcss-preset-env');
const pugLinter = require('gulp-pug-linter');
const reporter = require('postcss-reporter');
const rev = require('gulp-rev');
const sass = require('gulp-sass');
const scssParser = require('postcss-scss');
const sourcemaps = require('gulp-sourcemaps');
const stylelint = require('stylelint');
const tap = require('gulp-tap');
const uglify = require('gulp-uglify');
const unassertify = require('unassertify');
const unprefix = require('postcss-unprefix');
const { lastRun, watch, series, parallel, src, dest } = require('gulp');

// explicitly set the compiler in case it were to change to dart
sass.compiler = nodeSass;

// required to disable watching of I18N files in @ladjs/i18n
// otherwises tasks will fail to exit due to watchers running
process.env.I18N_SYNC_FILES = true;
process.env.I18N_AUTO_RELOAD = false;
process.env.I18N_UPDATE_FILES = true;

const env = require('./config/env');
const config = require('./config');

const PROD = config.env === 'production';
const DEV = config.env === 'development';
const TEST = config.env === 'test';

const staticAssets = [
  'assets/**/*',
  '!assets/css/**/*',
  '!assets/img/**/*',
  '!assets/js/**/*'
];

const manifestOptions = {
  merge: true,
  base: 'build'
};

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
  return src('app/views/**/*.pug', { since: lastRun(pug) })
    .pipe(pugLinter({ reporter: 'default', failAfterError: true }))
    .pipe(gulpif(DEV, lr(config.livereload)));
}

function img() {
  return src('assets/img/**/*', {
    base: 'assets',
    since: lastRun(img)
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
      gulpif(PROD, rev.manifest('build/rev-manifest.json', manifestOptions))
    )
    .pipe(gulpif(PROD, dest('build')));
}

function scss() {
  return src('assets/css/**/*.scss', {
    base: 'assets',
    since: lastRun(scss)
  }).pipe(
    postcss([stylelint(), reporter()], {
      syntax: scssParser
    })
  );
}

function css() {
  return src('assets/css/**/*.scss', {
    base: 'assets',
    since: lastRun(css)
  })
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(
      postcss([
        fontMagician({
          hosted: [path.join(__dirname, 'build', 'fonts'), '/fonts']
        }),
        unprefix(),
        postcssPresetEnv(),
        fontSmoothing(),
        ...(PROD ? [cssnano({ autoprefixer: false })] : []),
        reporter()
      ])
    )
    .pipe(gulpif(PROD, rev()))
    .pipe(sourcemaps.write('./'))
    .pipe(dest('build'))
    .pipe(gulpif(DEV, lr(config.livereload)))
    .pipe(
      gulpif(PROD, rev.manifest('build/rev-manifest.json', manifestOptions))
    )
    .pipe(gulpif(PROD, dest('build')));
}

function xo() {
  return src('.', { since: lastRun(xo) })
    .pipe(gulpXo({ quiet: true, fix: true }))
    .pipe(gulpXo.format())
    .pipe(gulpXo.failAfterError());
}

function eslint() {
  return src('build/**/*.js', { since: lastRun(eslint) })
    .pipe(
      gulpEslint({
        allowInlineConfig: false,
        configFile: '.build.eslintrc'
      })
    )
    .pipe(gulpEslint.format('pretty'))
    .pipe(gulpEslint.failAfterError());
}

// <https://github.com/gulpjs/gulp/blob/master/docs/recipes/browserify-multiple-destination.md>
function js() {
  return src('assets/js/**/*.js', {
    base: 'assets',
    since: lastRun(js)
  })
    .pipe(
      tap(file => {
        file.contents = browserify({
          entries: file.path,
          debug: true,
          basedir: 'assets'
        })
          .transform(babelify)
          .transform(unassertify, { global: true })
          .transform(envify(env), { global: true })
          .plugin(collapser)
          .plugin(commonShake)
          .bundle();
      })
    )
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(gulpif(PROD, uglify()))
    .pipe(gulpif(PROD, rev()))
    .pipe(sourcemaps.write('./'))
    .pipe(dest('build'))
    .pipe(gulpif(DEV, lr(config.livereload)))
    .pipe(
      gulpif(PROD, rev.manifest('build/rev-manifest.json', manifestOptions))
    )
    .pipe(gulpif(PROD, dest('build')));
}

function remark() {
  return src('.', { since: lastRun(remark) })
    .pipe(
      gulpRemark({
        quiet: true,
        frail: true
      })
    )
    .pipe(dest('.'));
}

function static() {
  return src(staticAssets, {
    base: 'assets',
    allowEmpty: true,
    since: lastRun(static)
  }).pipe(dest('build'));
}

function clean() {
  return del(['build']);
}

const build = series(
  clean,
  parallel(
    ...(TEST ? [] : [xo, remark]),
    parallel(img, static, series(scss, css), series(js, eslint))
  )
);

module.exports = {
  build,
  js,
  publish,
  watch: () => {
    lr.listen(config.livereload);
    watch(['**/*.js', '!assets/js/**/*.js'], xo);
    watch('assets/img/**/*', img);
    watch('assets/css/**/*.scss', series(scss, css));
    watch('assets/js/**/*.js', series(xo, js, eslint));
    watch('app/views/**/*.pug', pug);
    watch(staticAssets, static);
  },
  pug,
  img,
  xo,
  eslint,
  static,
  remark,
  scss,
  css,
  clean
};

exports.default = build;
