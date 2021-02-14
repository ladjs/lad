const { series, concurrent } = require('nps-utils');

module.exports = {
  scripts: {
    all: series.nps('build', 'apps-and-watch'),
    appsAndWatch: concurrent.nps('apps', 'watch'),
    apps: concurrent.nps('bree', 'api', 'web'),

    bree: 'nodemon bree.js',
    api: 'nodemon api.js',
    web: 'nodemon web.js',

    watch: 'gulp watch',
    clean: 'gulp clean',
    build: 'gulp build',
    publishAssets: 'gulp publish',

    lintJs: 'gulp xo',
    lintMd: 'gulp remark',
    lintPug: 'gulp pug',
    lint: concurrent.nps('lint-js', 'lint-md', 'lint-pug'),

    // <https://github.com/kentcdodds/nps-utils/issues/24>
    pretest: concurrent.nps('lint', 'build', 'pretest-redis'),
    // <https://stackoverflow.com/a/16974060/3586413>
    pretestRedis:
      "redis-cli EVAL \"return redis.call('del', 'defaultKey', unpack(redis.call('keys', ARGV[1])))\" 0 *_limit_test:*",

    test: 'ava',
    testCoverage: series('nps pretest', 'nyc ava'),
    testUpdateSnapshots: series('nps pretest', 'ava --update-snapshots'),

    coverage: 'nyc report --reporter=text-lcov > coverage.lcov && codecov'
  }
};
