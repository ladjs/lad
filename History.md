
n.n.n / 2015-06-26
==================

  * old wip
  * Temp
  * Merge pull request #110 from santiagobasulto/fix-109-config-for-testing
  * Fixes #109: Added info on README.md to include config when running eskimo tests.
  * Merge pull request #108 from niftylettuce/feature/wiki-link
  * Added link to the wiki
  * Merge pull request #107 from anotheri/feature/some-improvements
  * remove a typo
  * move liveReload to local.js config We usually use `nodemon app` for running application on dev server, so it causes liveReload connection error. That's why I moved it to local.js.
  * update package.json for config - add autoprefixer-core dependency for less-middleware
  * add option to disable less middleware for dev environment by default it's useful in case of using `gulp watch`, if you want to get working sourcemaps current version of less-middleware has a few issues with sourcemaps
  * update .gitignore
  * generate boot/config.js with: - environment-specific db names; - random session secret and cookieParser (via chance.js); - enabled autoprefixer for less middleware;
  * add gulp-autoprefixer
  * disable robots/googlebot indexing for non-prod envs
  * Merge pull request #105 from niftylettuce/hotfix/watch-jade
  * Increasing version to 0.2.25
  * Adding jade reload to gulp watch
  * Merge pull request #104 from niftylettuce/feature/gulp-nodemon-in-watch
  * Adds nodemon to `gulp watch`, & API tests Closes #90: add tests for API endpoints (already started, just needs finished) Closes #98: Object #<IncomingMessage> has no method 'flash' Upgrades igloo to 0.0.6 Updates version to 0.2.24
  * Merge pull request #102 from oitozero/master
  * Update Readme.md
  * Update Readme.md
  * Merge pull request #101 from oitozero/master
  * Update launching-soon-page/Readme.md w/ snowflake
  * Added express-jade for client-side Jade templates
