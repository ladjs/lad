
# Eskimo [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][depstat-image]][depstat-url] [![NPM downloads][npm-downloads]][npm-url]

![Eskimo](/eskimo.png?raw=true)

Eskimo lets you create and build an [`igloo`](https://github.com/niftylettuce/igloo).

**tldr;** `eskimo` is the CLI tool that is used to build projects with `igloo`, and `igloo` contains a set of common components used with `electrolyte` (dependency injection).

**Have some feedback or need to ask a question?** Join the public HipChat room at <http://www.hipchat.com/gpGoLR9pM>.


## Dependencies

* [Node](http://nodejs.org)
* [Redis](http://redis.io/)
* [MongoDB](http://www.mongodb.org/)


## Install

```bash
npm install -g eskimo
```


## Usage

```bash
eskimo --help
eskimo create <path>
eskimo model <name>
eskimo view <name>
eskimo controller <name>
```

Then spin up your app in either development or production mode:

```bash
DEBUG=* node app
```

```bash
sudo NODE_ENV=production node app
```

There is also a cluster app built in for zero-downtime when receiving a SIGUSR2 code:

```bash
sudo NODE_ENV=production node cluster
```


## Tests

```bash
npm install -d
npm test
```

## Contributors

* Nick Baugh <niftylettuce@gmail.com>


## Credits

* [Snow Shoes](http://thenounproject.com/term/snow-shoes/2678/) by Marc Serre from The Noun Project
* [ESKIMO IGLOO](http://www.colourlovers.com/palette/1933518/ESKIMO_IGLOO) (color palette)

[npm-url]: https://npmjs.org/package/eskimo
[npm-image]: http://img.shields.io/npm/v/eskimo.svg?style=flat
[npm-downloads]: http://img.shields.io/npm/dm/eskimo.svg?style=flat

[travis-url]: http://travis-ci.org/niftylettuce/eskimo
[travis-image]: http://img.shields.io/travis/niftylettuce/eskimo.svg?style=flat

[depstat-url]: https://gemnasium.com/niftylettuce/eskimo
[depstat-image]: http://img.shields.io/gemnasium/niftylettuce/eskimo.svg?style=flat

## License

[The MIT License](http://en.wikipedia.org/wiki/MIT_License)

Copyright (c) 2014- Nick Baugh niftylettuce@gmail.com (http://niftylettuce.com/)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
