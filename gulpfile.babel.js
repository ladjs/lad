
// babel requirements
import 'babel-polyfill';

// gulp dependencies
import awspublish from 'gulp-awspublish';
import cloudfront from 'gulp-cloudfront';
import runSequence from 'run-sequence';
import livereload from 'gulp-livereload';
import sourcemaps from 'gulp-sourcemaps';
import gulpif from 'gulp-if';
import eslint from 'gulp-eslint';
import gulp from 'gulp';
import babelify from 'babelify';
import source from 'vinyl-source-stream';
import uglify from 'gulp-uglify';
import browserify from 'browserify';
import buffer from 'vinyl-buffer';
import rev from 'gulp-rev';
import glob from 'glob';
import es from 'event-stream';
import imagemin from 'gulp-imagemin';
import pngquant from 'imagemin-pngquant';
import postcss from 'gulp-postcss';
import sass from 'gulp-sass';
import cssnano from 'cssnano';
import autoprefixer from 'autoprefixer';
import reporter from 'postcss-reporter';

import config from './src/config';

// create a new publisher
const publisher = awspublish.create(config.aws);

// define custom headers
const headers = {
  'Cache-Control': 'max-age=315360000, no-transform, public'
};

const PROD = config.env === 'production';

const processors = [
  reporter({
    clearMessages: true
  }),
  autoprefixer({
    browsers: [ 'last 2 versions' ]
  })
];

if (PROD) processors.push(cssnano());

gulp.task('default', [ 'build' ]);

gulp.task('build', done => {
  runSequence(
    'lint',
    'css',
    [ 'img', 'js', 'static', 'emails' ],
    done
  );
});

gulp.task('publish', () => {

  return gulp
    .src([
      'build/**/*',
      '!build/rev-manifest.json'
    ])
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
    .pipe(cloudfront(config.aws));

});

gulp.task('nunjucks', () => {
  return gulp
    .src('src/app/views/**/*.njk')
    .pipe(gulpif(!PROD, livereload(config.livereload)));
});

gulp.task('watch', [ 'build' ], (done) => {
  livereload.listen(config.livereload);
  gulp.watch('src/assets/img/**/*', [ 'img' ]);
  gulp.watch('src/assets/css/**/*.scss', [ 'css' ]);
  gulp.watch('src/assets/js/**/*.js', [ 'js' ]);
  gulp.watch('src/app/views/**/*.njk', [ 'nunjucks' ]);
  gulp.watch('src/emails/**/*', [ 'emails' ]);
});

gulp.task('img', () => {
  return gulp
    .src('src/assets/img/**/*', {
      base: 'src/assets'
    })
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [
        { removeViewBox: false },
        { cleanupIDs: false }
      ],
      use: [ pngquant() ]
    }))
    .pipe(gulp.dest('build'))
    .pipe(gulpif(!PROD, livereload(config.livereload)))
    .pipe(gulpif(PROD, rev.manifest('build/rev-manifest.json', {
      base: 'build'
    })))
    .pipe(gulpif(PROD, gulp.dest('build')));
});

gulp.task('css', () => {
  return gulp
    .src('src/assets/css/**/*.scss', {
      base: 'src/assets'
    })
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss(processors))
    .pipe(gulpif(PROD, rev()))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('build'))
    .pipe(gulpif(!PROD, livereload(config.livereload)))
    .pipe(gulpif(PROD, rev.manifest('build/rev-manifest.json', {
      merge: true, base: 'build'
    })))
    .pipe(gulpif(PROD, gulp.dest('build')));
});

gulp.task('lint', () => {
  return gulp
    .src('src/assets/js/**/*.js')
    .pipe(eslint())
    .pipe(eslint.format());
});

gulp.task('js', [ 'lint' ], done => {

  glob('js/**/*.js', {
    cwd: 'src/assets'
  }, (err, files) => {

    if (err) return done(err);

    const tasks = files.map(entry => {
      return browserify({
        entries: entry,
        debug: false,
        basedir: 'src/assets'
      })
      .transform(babelify)
      .bundle()
      .pipe(source(entry))
      .pipe(buffer())
      .pipe(sourcemaps.init({
        // loads map from browserify file
        loadMaps: true
      }))
      .pipe(gulpif(PROD, uglify()))
      .pipe(gulpif(PROD, rev()))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('build'))
      .pipe(gulpif(!PROD, livereload(config.livereload)));
    });

    const taskStream = es.merge(tasks);

    if (PROD)
      taskStream
        .pipe(rev.manifest('build/rev-manifest.json', {
          merge: true,
          base: 'build'
        }))
        .pipe(gulp.dest('build'));

    taskStream.on('end', done);

  });

});

gulp.task('emails', () => {
  return gulp.src(['src/emails/**/*'], {
    base: 'src/emails'
  }).pipe(gulp.dest('lib/emails'));
});

gulp.task('static', () => {
  return gulp
    .src([
      'src/assets/browserconfig.xml',
      'src/assets/favicon.ico',
      'src/assets/manifest.json',
      'src/assets/fonts/**/*'
    ], {
      base: 'src/assets'
    })
    .pipe(gulp.dest('build'));
});

