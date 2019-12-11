const path = require('path');
const fs = require('fs');

const AWS = require('aws-sdk');
const _ = require('lodash');
const awscloudfront = require('gulp-awspublish-cloudfront');
const awspublish = require('gulp-awspublish');
const babel = require('gulp-babel');
const browserify = require('browserify');
const collapser = require('bundle-collapser/plugin');
const cssnano = require('cssnano');
const del = require('del');
const envify = require('gulp-envify');
const fontMagician = require('postcss-font-magician');
const fontSmoothing = require('postcss-font-smoothing');
const globby = require('globby');
const gulpEslint = require('gulp-eslint');
const gulpRemark = require('gulp-remark');
const gulpXo = require('gulp-xo');
const gulpif = require('gulp-if');
const imagemin = require('gulp-imagemin');
const lr = require('gulp-livereload');
const makeDir = require('make-dir');
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
const terser = require('gulp-terser');
const unassert = require('gulp-unassert');
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
const logger = require('./helpers/logger');

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
  base: config.buildBase
};

// set aws logger
AWS.config.logger = logger;

function publish() {
  // create a new publisher
  const publisher = awspublish.create(
    _.merge(config.aws, {
      params: {
        Bucket: env.AWS_S3_BUCKET
      }
    })
  );
  return (
    src([`${config.buildBase}/**/*`, `!${config.manifest}`])
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
      .pipe(awscloudfront(env.AWS_CLOUDFRONT_DISTRIBUTION_ID))
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
    .pipe(dest(config.buildBase))
    .pipe(gulpif(DEV, lr(config.livereload)))
    .pipe(gulpif(PROD, rev.manifest(config.manifest, manifestOptions)))
    .pipe(gulpif(PROD, dest(config.buildBase)));
}

function scss() {
  return src('assets/css/**/*.scss', {
    base: 'assets'
  }).pipe(
    postcss([stylelint(), reporter()], {
      syntax: scssParser
    })
  );
}

function css() {
  return src('assets/css/**/*.scss', {
    base: 'assets'
  })
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(
      postcss([
        fontMagician({
          hosted: [path.join(__dirname, config.buildBase, 'fonts'), '/fonts']
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
    .pipe(dest(config.buildBase))
    .pipe(gulpif(DEV, lr(config.livereload)))
    .pipe(gulpif(PROD, rev.manifest(config.manifest, manifestOptions)))
    .pipe(gulpif(PROD, dest(config.buildBase)));
}

function xo() {
  return src('.', { since: lastRun(xo) })
    .pipe(gulpXo({ quiet: true, fix: true }))
    .pipe(gulpXo.format())
    .pipe(gulpXo.failAfterError());
}

function eslint() {
  return src(`${config.buildBase}/**/*.js`, { since: lastRun(eslint) })
    .pipe(
      gulpEslint({
        allowInlineConfig: false,
        configFile: '.build.eslintrc'
      })
    )
    .pipe(gulpEslint.format('pretty'))
    .pipe(gulpEslint.failAfterError());
}

async function bundle() {
  // make build/js folder for compile task
  await makeDir(path.join(config.buildBase, 'js'));
  const paths = await globby('**/*.js', { cwd: 'assets/js' });
  const b = browserify({
    entries: paths.map(str => `assets/js/${str}`),
    debug: true
  });
  return (
    b
      .plugin(collapser)
      .plugin('factor-bundle', {
        outputs: paths.map(str => path.join(config.buildBase, 'js', str))
      })
      .bundle()
      // .bundle((err, buffer) => {
      .pipe(
        fs.createWriteStream(
          path.join(config.buildBase, 'js', 'factor-bundle.js')
        )
      )
  );
}

async function compile() {
  return src('build/js/**/*.js', {
    since: lastRun(compile)
  })
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(envify(env))
    .pipe(unassert())
    .pipe(babel())
    .pipe(gulpif(PROD, terser()))
    .pipe(gulpif(PROD, rev()))
    .pipe(sourcemaps.write('./'))
    .pipe(dest(config.buildBase))
    .pipe(gulpif(DEV, lr(config.livereload)))
    .pipe(gulpif(PROD, rev.manifest(config.manifest, manifestOptions)))
    .pipe(gulpif(PROD, dest(config.buildBase)));
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
  }).pipe(dest(config.buildBase));
}

function clean() {
  return del([config.buildBase]);
}

const js = series(bundle, compile);

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
