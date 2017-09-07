const http = require('http');
const url = require('url');

const app = http.createServer((req, res) => {
  res.writeHead(301, {
    Location: url.parse(`https://${req.headers.host}${req.url}`).href
  });

  res.end();
});

if (!module.parent) app.listen(80);

module.exports = app;
