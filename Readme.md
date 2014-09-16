
# Eskimo

[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![NPM downloads][npm-downloads]][npm-url]
[![Test Coverage][coveralls-image]][coveralls-url]
[![MIT License][license-image]][license-url]
[![Gitter][gitter-image]][gitter-url]

![Eskimo](eskimo.png?raw=true)

> Eskimo helps you to rapidly build [Node](http://nodejs.org) powered API's, online stores, and apps in general (known as "[igloos](http://igloojs.com/)").  Requires [Node](http://nodejs.org) >= 0.10.x, [Redis](http://redis.io) for sessions, and your choice of either [Knex](http://knexjs.org)/[Bookshelf](http://bookshelfjs.org) (SQL) or [Mongoose](http://mongoosejs.com) (MongoDB) for data.


## Index

* [Sponsor](#sponsor)
* [Install](#install)
* [Screencast](#screencast)
* [Commands](#commands)
* [Examples](#examples)
* [Free Stickers](#free-stickers)
* [Tests](#tests)
* [Conventions](#conventions)
* [Contributors](#contributors)
* [Credits](#credits)
* [License](#license)

## Sponsor

[![Clevertech](http://eskimo.io/img/clevertech.png)](http://clevertech.biz)


## Install

```bash
npm install -g eskimo
```


## Screencast

> TODO: Basic screencast here


## Commands

Bundled with the CLI are simple commands and options.

```bash
eskimo --help
Usage: eskimo [options] [command]

Commands:

  create <dirname>       create a new igloo
  model <name>           create a new model
  view <name>            create a new view
  controller <name>      create a new controller
  mvc <name>             create a new model, view, and controller

Options:

  -h, --help                output usage information
  -V, --version             output the version number
  -N, --no-update-notifier  disable update notifier
  -T, --no-tracking         disable anonymous tracking
```

Once you've created an igloo, see the generated Readme.md file.

> [**Please read Igloo's documentation for more information.**](http://igloojs.com)

## Examples

* [Launching Soon Page][launching-soon-page]
* [Stripe-powered Store][stripe-powered-store]
* [RESTful API][restful-api]
* [Zero-downtime Reloads][zero-downtime-reloads]
* [Referral System][referral-system]
* [Facebook &amp; Google Log In][facebook-and-google-log-in]
* [Webhook Deploys][webhook-deploys]
* [CDN-hosted Assets][cdn-hosted-assets]

[launching-soon-page]: examples/launching-soon-page
[stripe-powered-store]: examples/stripe-powered-store
[restful-api]: examples/restful-api
[zero-downtime-reloads]: examples/zero-downtime-reloads
[referral-system]: examples/referral-system
[facebook-and-google-log-in]: examples/facebook-and-google-log-in
[webhook-deploys]: examples/webhook-deploys
[cdn-hosted-assets]: examples/cdn-hosted-assets


## Free Stickers

Want a free Eskimo snow shoes sticker?  Just submit [this form][google-form].


## Tests

```bash
npm install -d
npm test
```


## Conventions

See [nifty-conventions][nifty-conventions] for code guidelines, general project requirements, and git workflow.


## Contributors

* Nick Baugh <niftylettuce@gmail.com>
* Adnan Ibrišimbegović <adibih@gmail.com>


## Credits

* [Snow Shoes](http://thenounproject.com/term/snow-shoes/2678/) by Marc Serre from The Noun Project
* [ESKIMO IGLOO](http://www.colourlovers.com/palette/1933518/ESKIMO_IGLOO) (color palette)


## License

[MIT][license-url]


[license-image]: http://img.shields.io/badge/license-MIT-blue.svg?style=flat
[license-url]: LICENSE
[google-form]: http://goo.gl/vx1VRp
[nifty-conventions]: https://github.com/niftylettuce/nifty-conventions
[npm-image]: http://img.shields.io/npm/v/eskimo.svg?style=flat
[npm-url]: https://npmjs.org/package/eskimo
[npm-downloads]: http://img.shields.io/npm/dm/eskimo.svg?style=flat
[travis-url]: http://travis-ci.org/niftylettuce/eskimo
[travis-image]: http://img.shields.io/travis/niftylettuce/eskimo.svg?style=flat
[coveralls-image]: https://img.shields.io/coveralls/niftylettuce/eskimo.svg?style=flat
[coveralls-url]: https://coveralls.io/r/niftylettuce/eskimo?branch=master
[gitter-url]: https://gitter.im/niftylettuce/eskimo?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge
[gitter-image]: https://badges.gitter.im/Join%20Chat.svg
