const { series, concurrent } = require('nps-utils');

module.exports = {
  scripts: {
    all: series.nps('build', 'apps-and-watch'),
    appsAndWatch: concurrent.nps('apps', 'watch'),
    apps: concurrent.nps('bull', 'api', 'web'),

    bull: 'nodemon bull.js',
    api: 'nodemon api.js',
    web: 'nodemon web.js',

    watch: 'gulp watch',
    clean: 'gulp clean',
    build: 'gulp build',
    publishAssets: 'gulp publish',

    lint: series('gulp xo', 'gulp eslint', 'gulp remark', 'gulp pug'),

    // <https://github.com/kentcdodds/nps-utils/issues/24>
    pretest: concurrent.nps('lint', 'build', 'pretest-mongo', 'pretest-redis'),
    pretestMongo: "mongo lad_test --eval 'db.dropDatabase()'",
    // <https://stackoverflow.com/a/16974060/3586413>
    pretestRedis:
      "redis-cli EVAL \"return redis.call('del', 'defaultKey', unpack(redis.call('keys', ARGV[1])))\" 0 limit_test:*",

    test: 'ava',
    testCoverage: series('nps pretest', 'nyc ava'),
    testUpdateSnapshots: series('nps pretest', 'ava --update-snapshots'),

    coverage: 'nyc report --reporter=text-lcov > coverage.lcov && codecov'
  }
};
