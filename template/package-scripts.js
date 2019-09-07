const fs = require('fs');
const path = require('path');
const { crossEnv, series, concurrent } = require('nps-utils');

const testEnv = fs
  .readFileSync(path.join(__dirname, 'test', '.env'), 'utf8')
  .split('\n')
  .join(' ')
  .trim();

module.exports = {
  scripts: {
    all: `${crossEnv('OPEN_BROWSER=true')} ${concurrent.nps(
      'apps',
      'build',
      'watch'
    )}`,
    apps: concurrent.nps('agenda', 'api', 'web'),
    agenda: 'nodemon agenda.js',
    api: 'nodemon api.js',
    web: 'nodemon web.js',
    watch: 'gulp watch',
    build: series('shx rm -rf build', 'gulp build'),
    lint: series('xo', 'remark . -qfo', 'pug-lint app/views'),

    // <https://github.com/kentcdodds/nps-utils/issues/24>
    pretest: crossEnv(
      `${testEnv} ${concurrent.nps(
        'lint',
        'build',
        'pretest-mongo',
        'pretest-redis'
      )}`
    ),
    pretestMongo: "mongo lad_test --eval 'db.dropDatabase()'",
    // <https://stackoverflow.com/a/16974060/3586413>
    pretestRedis:
      "redis-cli EVAL \"return redis.call('del', 'defaultKey', unpack(redis.call('keys', ARGV[1])))\" 0 limit_test:*",

    test: crossEnv(`${testEnv} ava`),
    testCoverage: crossEnv(`${testEnv} ${series('nps pretest', 'nyc ava')}`),
    testUpdateSnapshots: crossEnv(
      `${testEnv} ${series('nps pretest', 'ava --update-snapshots')}`
    ),

    coverage: 'nyc report --reporter=text-lcov > coverage.lcov && codecov',

    publishAssets: 'gulp publish',

    postDeploy: series.nps(
      'yarn',
      'yarn build',
      'publish-assets',
      'pm2 startOrGracefulReload ecosystem.json --env production'
    )
  }
};
