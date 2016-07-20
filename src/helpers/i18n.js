
import i18n from 'i18n';

import Logger from './logger';
import config from '../config';

// globally register i18n
i18n.configure({
  directory: config.localesDirectory,
  logDebugFn: Logger.debug,
  logWarnFn: Logger.warn,
  logErrorFn: Logger.error,
  indent: '  ',
  api: {
    __: 't'
  },
  register: global
  // autoReload: true
});

i18n.t = i18n.__;

export default i18n;
