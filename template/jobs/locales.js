const path = require('path');
const { promisify } = require('util');
const fs = require('fs-extra');
const GoogleTranslate = require('google-translate');
const _ = require('lodash');

const { i18n, logger } = require('../helpers');
const config = require('../config');

// setup google translate with api key
const googleTranslate = new GoogleTranslate(config.googleTranslateKey);
// convert to a promise the translation function
const translate = promisify(googleTranslate.translate).bind(googleTranslate);

module.exports = async function(job, done) {
  const defaultFields = _.zipObject(
    _.values(i18n.config.phrases),
    _.values(i18n.config.phrases)
  );

  const defaultLocaleFilePath = path.join(
    i18n.config.directory,
    `${i18n.config.defaultLocale}.json`
  );

  let defaultLocaleFile;
  try {
    defaultLocaleFile = require(defaultLocaleFilePath);
  } catch (err) {
    defaultLocaleFile = {};
  }

  try {
    await Promise.all(
      i18n.config.locales.map(locale => {
        logger.info(`checking locale of "${locale}"`);
        return new Promise(async (resolve, reject) => {
          const filePath = path.join(i18n.config.directory, `${locale}.json`);

          // look up the file, and if it does not exist, then
          // create it with an empty object
          let file;
          try {
            file = require(filePath);
          } catch (err) {
            file = {};
          }

          // add any missing fields if they don't exist
          file = _.defaultsDeep(file, defaultFields);

          // if the locale is not the default
          // then check if translations need done
          if (locale !== i18n.config.defaultLocale) {
            const translationsRequired = _.intersection(
              _.uniq(
                _.concat(
                  _.values(i18n.config.phrases),
                  _.values(defaultLocaleFile)
                )
              ),
              _.values(file)
            );

            if (translationsRequired.length > 0)
              logger.info(
                `translating (${translationsRequired.length}) phrases in ${locale}`
              );

            // attempt to translate all of these in the given language
            const promises = _.map(translationsRequired, phrase => {
              // TODO: prevent %s %d and %j from getting translated
              // <https://nodejs.org/api/util.html#util_util_format_format>
              //
              // TODO: also prevent {{...}} from getting translated
              // by wrapping such with `<span class="notranslate">`?

              // only give the Google API a few seconds to finish
              return Promise.race([
                new Promise(resolve => {
                  setTimeout(() => {
                    logger.warn('google translate API did not respond in 4s');
                    resolve();
                  }, 20000);
                }),
                translate(phrase, locale)
              ]);
            });

            // get the translation results from Google
            try {
              const results = await Promise.all(promises);
              _.each(_.compact(results), result => {
                // replace `|` pipe character because translation will
                // interpret as ranged interval
                // <https://github.com/mashpie/i18n-node/issues/274>
                // TODO: maybe we should use `he` package to re-encode entities
                file[result.originalText] = result.translatedText.replace(
                  /\|/g,
                  '&#124;'
                );
              });
            } catch (err) {
              logger.error(err);
            }
          }

          // write the file again
          try {
            await fs.writeFile(filePath, JSON.stringify(file, null, 2));
            resolve();
          } catch (err) {
            reject(err);
          }
        });
      })
    );

    done();
  } catch (err) {
    done(err);
  }
};
