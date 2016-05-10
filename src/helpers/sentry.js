
import raven from 'raven';
import config from '../config';

export default new raven.Client(config.sentry);
