const customFonts = require('custom-fonts-in-emails');

const config = require('../config');

async function getEmailLocals() {
  const appNameImage = await customFonts.png2x({
    text: config.appName,
    fontSize: 30,
    backgroundColor: '#f8f9fa',
    fontNameOrPath: 'Bitter Regular'
  });

  return { appNameImage };
}

module.exports = getEmailLocals;
