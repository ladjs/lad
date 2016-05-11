
// turn off max length eslint rule since this is a config file with long strs
/* eslint max-len: 0*/

import dotenv from 'dotenv';

// load default env vars from `.env` file
dotenv.load();

export default {
  koaManifestRev: {
    prepend: `//${process.env.AWS_CF_DOMAIN}/`
  }
};
