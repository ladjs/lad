// eslint-disable-next-line import/no-unassigned-import
require('./config/env');

const Graceful = require('@ladjs/graceful');
const ProxyServer = require('@ladjs/proxy');
const ip = require('ip');

const logger = require('./helpers/logger');

const proxy = new ProxyServer({
  logger
});

if (!module.parent) {
  const graceful = new Graceful({ servers: [proxy], logger });
  graceful.listen();

  (async () => {
    try {
      await proxy.listen(proxy.config.port);
      if (process.send) process.send('ready');
      const { port } = proxy.server.address();
      logger.info(
        `Lad proxy server listening on ${port} (LAN: ${ip.address()}:${port})`
      );
    } catch (err) {
      logger.error(err);
      // eslint-disable-next-line unicorn/no-process-exit
      process.exit(1);
    }
  })();
}
