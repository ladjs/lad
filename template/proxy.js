const proxy = require('@ladjs/proxy');

proxy.listen('127.0.0.1', process.env.PROXY_PORT);
