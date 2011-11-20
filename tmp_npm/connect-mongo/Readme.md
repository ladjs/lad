# connect-mongo

  MongoDB session store for Connect

  connect-mongo supports only connect `>= 1.0.3`.

## Installation

via npm:

    $ npm install connect-mongo

## Options

  - `db` Database name
  - `collection` Collection (optional, default: `sessions`) 
  - `host` MongoDB server hostname (optional, default: `127.0.0.1`)
  - `port` MongoDB server port (optional, default: `27017`)
  - `username` Username (optional)
  - `password` Password (optional)
  - `url` Connection url of the form: `mongodb://user:pass@host:port/database/collection`.
          If provided, information in the URL takes priority over the other options.
  - `clear_interval` Interval in seconds to clear expired sessions (optional, default: `-1`).
          Values <= 0 disable expired session clearing.

## Example

With express:

    var MongoStore = require('connect-mongo');

    app.use(express.session({
        secret: settings.cookie_secret,
        store: new MongoStore({
          db: settings.db
        })
      }));

## Tests

You need `expresso`.

    make test

The tests use a database called `connect-mongo-test`.

## License 

(The MIT License)

Copyright (c) 2011 Casey Banner &lt;kcbanner@gmail.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.