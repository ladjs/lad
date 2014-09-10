
// # local config (make sure it is ignored by git)
//
// This configuration file is specific to each developer's environment,
// and will merge on top of all other settings from ./config.js
//

exports = module.exports = function() {
  'use strict';

  return {

    local: {
      showStack: false,
    }

  }

}

exports['@singleton'] = true
