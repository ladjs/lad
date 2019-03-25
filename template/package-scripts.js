const fs = require('fs');
const path = require('path');
const npsUtils = require('nps-utils');

const testEnv = fs
  .readFileSync(path.join(__dirname, 'test', '.env'), 'utf8')
  .split('\n')
  .join(' ')
  .trim();

const gulpEnv = fs
  .readFileSync(path.join(__dirname, '.gulpfile.env'), 'utf8')
  .split('\n')
  .join(' ')
  .trim();

module.exports = {
  scripts: {
    all: `${npsUtils.crossEnv('OPEN_BROWSER=true')} ${npsUtils.concurrent.nps(
      'watch',
      'agenda',
      'api',
      'web'
    )}`,
    agenda: 'nodemon agenda.js',
    api: 'nodemon api.js',
    web: 'nodemon web.js',
    watch: npsUtils.crossEnv(`WATCH=true ${gulpEnv} gulp watch`),
    build: npsUtils.crossEnv(`${gulpEnv} gulp build`),
    buildAndLint: npsUtils.series.nps('build', 'lint'),
    lint: npsUtils.series('xo', 'eslint build/**/*.js', 'nps lint-md'),
    lintMd: npsUtils.series(
      `node -e 'require("shelljs").echo("# Temp\\n").to("./temp.md")'`,
      'remark . -qfo',
      `node -e 'require("shelljs").rm("./temp.md")'`
    ),

    // <https://github.com/kentcdodds/nps-utils/issues/24>
    pretest: npsUtils.crossEnv(
      `${testEnv} ${npsUtils.concurrent.nps(
        'build-and-lint',
        'pretest-mongo',
        'pretest-redis'
      )}`
    ),
    pretestMongo: `mongo lad_test --eval 'db.dropDatabase()'`,
    // <https://stackoverflow.com/a/16974060/3586413>
    pretestRedis: `redis-cli EVAL "return redis.call('del', 'defaultKey', unpack(redis.call('keys', ARGV[1])))" 0 limit_test:*`,

    test: npsUtils.crossEnv(`${testEnv} ava`),
    testCoverage: npsUtils.crossEnv(
      `${testEnv} ${npsUtils.series('nps pretest', 'nyc ava')}`
    ),
    testUpdateSnapshots: npsUtils.crossEnv(
      `${testEnv} ${npsUtils.series('nps pretest', 'ava --update-snapshots')}`
    ),

    coverage: 'nyc report --reporter=text-lcov > coverage.lcov && codecov',

    publishAssets: npsUtils.crossEnv(`${gulpEnv} gulp publish`),

    postDeploy: npsUtils.series.nps(
      'yarn',
      'yarn build',
      'publish-assets',
      'pm2 startOrGracefulReload ecosystem.json --env production'
    )
  }
};
