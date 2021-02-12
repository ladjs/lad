// eslint-disable-next-line import/no-unassigned-import
require('./config/env');

const path = require('path');
const fs = require('fs');

const Graceful = require('@ladjs/graceful');
const Mandarin = require('mandarin');
const RevAll = require('gulp-rev-all');
const babel = require('gulp-babel');
const browserify = require('browserify');
const concat = require('gulp-concat');
const cssnano = require('cssnano');
const del = require('del');
const envify = require('@ladjs/gulp-envify');
const fontMagician = require('postcss-font-magician');
const getStream = require('get-stream');
const globby = require('globby');
const gulpRemark = require('gulp-remark');
const gulpXo = require('gulp-xo');
const imagemin = require('gulp-imagemin');
const lr = require('gulp-livereload');
const makeDir = require('make-dir');
const nodeSass = require('node-sass');
const pngquant = require('imagemin-pngquant');
const postcss = require('gulp-postcss');
const postcssPresetEnv = require('postcss-preset-env');
const pugLinter = require('gulp-pug-linter');
const reporter = require('postcss-reporter');
const rev = require('gulp-rev');
const revSri = require('gulp-rev-sri');
const sass = require('gulp-sass');
const scssParser = require('postcss-scss');
const sourcemaps = require('gulp-sourcemaps');
const stylelint = require('stylelint');
const terser = require('gulp-terser');
const through2 = require('through2');
const unassert = require('gulp-unassert');
const { lastRun, watch, series, parallel, src, dest } = require('gulp');

// explicitly set the compiler in case it were to change to dart
sass.compiler = nodeSass;

// required to disable watching of I18N files in @ladjs/i18n
// otherwises tasks will fail to exit due to watchers running
process.env.I18N_SYNC_FILES = true;
process.env.I18N_AUTO_RELOAD = false;
process.env.I18N_UPDATE_FILES = true;

const config = require('./config');
const logger = require('./helpers/logger');
const i18n = require('./helpers/i18n');

const PROD = config.env === 'production';
const DEV = config.env === 'development';
const TEST = config.env === 'test';
const staticAssets = [
  'assets/**/*',
  '!assets/css/**/*',
  '!assets/img/**/*',
  '!assets/js/**/*'
];

function pug() {
  let stream = src('app/views/**/*.pug', { since: lastRun(pug) }).pipe(
    pugLinter({ reporter: 'default', failAfterError: true })
  );

  if (DEV) stream = stream.pipe(lr(config.livereload));

  return stream;
}

function img() {
  let stream = src('assets/img/**/*', {
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
    .pipe(dest(config.buildBase));

  if (DEV) stream = stream.pipe(lr(config.livereload));
  return stream;
}

function fonts() {
  return src(['node_modules/@fortawesome/fontawesome-free/webfonts/**/*']).pipe(
    dest(path.join(config.buildBase, 'fonts'))
  );
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
  let stream = src('assets/css/**/*.scss', {
    base: 'assets'
  })
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(
      postcss([
        fontMagician({
          foundries: ['custom', 'hosted'],
          // note if you modify this then you will have to
          // also modify the font awesome fonts in css folder
          // <https://caniuse.com/#feat=woff2>
          formats: 'woff ttf',
          hosted: [path.join(__dirname, config.buildBase, 'fonts'), '../fonts'],
          display: 'swap'
        }),
        postcssPresetEnv({ browsers: 'extends @ladjs/browserslist-config' }),
        ...(PROD ? [cssnano({ autoprefixer: false })] : []),
        reporter()
      ])
    );

  stream = stream.pipe(sourcemaps.write('./')).pipe(dest(config.buildBase));

  if (DEV) stream = stream.pipe(lr(config.livereload));

  return stream;
}

function xo() {
  return src('.', { since: lastRun(xo) })
    .pipe(gulpXo({ quiet: true, fix: true }))
    .pipe(gulpXo.format())
    .pipe(gulpXo.failAfterError());
}

// TODO: in the future use merge-streams and return a stream w/o through2
async function bundle() {
  const since = lastRun(bundle);
  const polyfillPath = path.join(config.buildBase, 'js', 'polyfill.js');
  const factorBundlePath = path.join(
    config.buildBase,
    'js',
    'factor-bundle.js'
  );

  await makeDir(path.join(config.buildBase, 'js'));

  async function getFactorBundle() {
    const paths = await globby('**/*.js', { cwd: 'assets/js' });
    const factorBundle = await new Promise((resolve, reject) => {
      browserify({
        entries: paths.map((string) => `assets/js/${string}`),
        debug: true
      })
        .plugin('bundle-collapser/plugin')
        .plugin('factor-bundle', {
          outputs: paths.map((string) =>
            path.join(config.buildBase, 'js', string)
          )
        })
        .bundle((err, data) => {
          if (err) return reject(err);
          resolve(data);
        });
    });
    await fs.promises.writeFile(factorBundlePath, factorBundle);
  }

  await Promise.all([
    fs.promises.copyFile(
      path.join(
        __dirname,
        'node_modules',
        '@babel',
        'polyfill',
        'dist',
        'polyfill.js'
      ),
      polyfillPath
    ),
    getFactorBundle()
  ]);

  // concatenate files
  await getStream(
    src([
      'build/js/polyfill.js',
      'build/js/factor-bundle.js',
      'build/js/uncaught.js',
      'build/js/core.js'
    ])
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(concat('build.js'))
      .pipe(sourcemaps.write('./'))
      .pipe(dest(path.join(config.buildBase, 'js')))
      .pipe(through2.obj((chunk, enc, cb) => cb()))
  );

  let stream = src('build/js/**/*.js', { base: 'build', since })
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(unassert())
    .pipe(envify())
    .pipe(babel());

  if (PROD) stream = stream.pipe(terser());

  stream = stream.pipe(sourcemaps.write('./')).pipe(dest(config.buildBase));

  if (DEV) stream = stream.pipe(lr(config.livereload));

  stream = stream.pipe(dest(config.buildBase));

  // convert to conventional stream
  stream = stream.pipe(through2.obj((chunk, enc, cb) => cb()));

  await getStream(stream);
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

async function markdown() {
  const mandarin = new Mandarin({
    i18n,
    logger
  });
  const graceful = new Graceful({ redisClients: [mandarin.redisClient] });
  await mandarin.markdown();
  await graceful.stopRedisClients();
}

async function sri() {
  await getStream(
    src('build/**/*.{css,js}')
      .pipe(RevAll.revision())
      .pipe(dest(config.buildBase))
      .pipe(RevAll.manifestFile())
      .pipe(dest(config.buildBase))
      .pipe(revSri({ base: config.buildBase }))
      .pipe(dest(config.buildBase))
      // convert to conventional stream
      .pipe(through2.obj((chunk, enc, cb) => cb()))
  );

  //
  // get all non css and non js files since rev-all ignores others
  // and merge rev-manifest.json with fonts and other non rev-all assets
  //
  // <https://github.com/smysnk/gulp-rev-all/blob/7fc61344df3b4377bf54b70d938cda8771096ebb/revisioner.js#L24
  // <https://github.com/smysnk/gulp-rev-all/issues/106>
  // <https://github.com/smysnk/gulp-rev-all/issues/165#issuecomment-338064409>
  //
  // note that we don't pipe fonts through gulp rev due to binary issues
  //
  await getStream(
    src([
      'build/**/*',
      '!build/**/*.{css,js}',
      '!build/fonts/**/*',
      '!build/robots.txt',
      '!build/browserconfig.xml'
    ])
      .pipe(rev())
      .pipe(dest(config.buildBase))
      .pipe(
        rev.manifest(config.manifest, {
          merge: true,
          base: config.buildBase
        })
      )
      .pipe(revSri({ base: config.buildBase }))
      .pipe(dest(config.buildBase))
      // convert to conventional stream
      .pipe(through2.obj((chunk, enc, cb) => cb()))
  );
}

function clean() {
  return del([config.buildBase]);
}

const build = series(
  clean,
  parallel(
    ...(TEST ? [] : [xo, remark]),
    series(
      parallel(img, static, markdown, series(fonts, scss, css), bundle),
      sri
    )
  )
);

module.exports = {
  clean,
  build,
  bundle,
  sri,
  markdown,
  watch: () => {
    lr.listen(config.livereload);
    watch(['**/*.js', '!assets/js/**/*.js'], xo);
    watch(Mandarin.DEFAULT_PATTERNS, markdown);
    watch('assets/img/**/*', img);
    watch('assets/css/**/*.scss', series(fonts, scss, css));
    watch('assets/js/**/*.js', series(xo, bundle));
    watch('app/views/**/*.pug', pug);
    watch(staticAssets, static);
  },
  pug,
  img,
  xo,
  static,
  remark,
  fonts,
  scss,
  css
};

exports.default = build;
