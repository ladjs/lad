
// # local config (make sure it is ignored by git)
//
// This configuration file is specific to each developer's environment,
// and will merge on top of all other settings from ./config.js
// (but only will merge in development environment)
//

exports = module.exports = function() {
  return {
    cache: false,
    server: {
      host: '0.0.0.0',
      port: 3000
    },
    email: {
      // <https://github.com/andris9/Nodemailer>
      transport: {
        service: 'gmail',
        auth: {
          user: 'user@gmail.com',
          pass: 'abc123'
        }
      }
    }
  }
}

exports['@singleton'] = true
