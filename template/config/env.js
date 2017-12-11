const path = require('path');

// note that we had to specify absolute paths here
// because otherwise tests run from the lad repo
// root folder would not work properly and pick this up
const env = require('@ladjs/env')({
  path: path.join(__dirname, '..', '.env'),
  defaults: path.join(__dirname, '..', '.env.defaults'),
  schema: path.join(__dirname, '..', '.env.schema')
});

module.exports = env;
