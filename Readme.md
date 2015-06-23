
# Eskimo

[![NPM version][npm-image]][npm-url]
[![Circle CI][circleci-image]][circleci-url]
[![Build Status][travis-image]][travis-url]
[![NPM downloads][npm-downloads]][npm-url]
[![Test Coverage][coveralls-image]][coveralls-url]
[![Static Analysis][codeclimate-image]][codeclimate-url]
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

## Documentation

[The wiki](https://github.com/niftylettuce/eskimo/wiki) is the main source for additional documentation.


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

Usage samples:

```bash
# To create a new igloo in `./awesome`:
eskimo create awesome

# To create a new model, views, and controller (with routes and tests) for "tags", in `./app/views/tags/*.jade`, `./app/models/tag.js`, `./app/controllers/tags.js`, `./app/routes/tags.js`, and `./test/99-tags.test.js`:
eskimo mvc tag
# Note: You could write "tags" as well (no quotes necessary if there are no spaces)

# To create a new controller (with routes and tests) in `./app/controllers/user-settings.js`, `./app/routes/user-settings.js`, and `./test/99-user-settings.test.js`
eskimo controller 'user settings'
# Note: You could write "user-settings" as well (no quotes necessary if there are no spaces)
```

> [**Please read Igloo's documentation for more information.**](http://igloojs.com) or your created igloo's `Readme.md`.


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

To run tests you'll need to have configuration set up. Config lives under `/boot/config.js` (as stated before).

We've provided a base config template, which you will need to copy it to your local folder in order to run tests.

```bash
cp ./templates/boot/config.js ./boot/config.js
```

```bash
npm install -d
npm test
```


## Assets

Assets refer to static files (scripts, stylesheets and other assets) placed in [assets/public](https://github.com/niftylettuce/eskimo/tree/master/assets/public). To build a production version of your app:

```bash
gulp build
```

Note: This will minify all assets and create a `./assets/dist` folder optimized and ready for deployment.

List of tasks executed during `gulp build`:
* Automatic LESS processing
* Automatic install of Bower packages
* Automatic images minification
* Automatic `usemin` implementation (concat, rev, ...)

Below is an example of a Jade file using `usemin` blocks:

```jade

//- # layout

//- ...

//- build:js /js/app.js
block scripts
  script(src='/bower/jquery/dist/jquery.js')
  script(src='/bower/bootstrap/dist/js/bootstrap.js')
  script(src='/bower/bootbox/bootbox.js')
  script(src='/js/plugins.js')
  script(src='/js/main.js')
  if settings.facebook.enabled
    script(src='/js/fb-appended-hash-bug-fix.js')
//- endbuild

```

After running `gulp build`, the file will be optimized:

```jade

//- # layout

//- ...

script(src='/js/app-316568f4.js')

```


## Conventions

See [nifty-conventions][nifty-conventions] for code guidelines, general project requirements, and git workflow.


## Contributors

* [Nick Baugh](https://github.com/niftylettuce)
* [Adnan Ibrišimbegović](https://github.com/adnan-i)
* [Bruno Bernardino](https://github.com/BrunoBernardino)
* [Yanick Landry](https://github.com/yanicklandry)
* [Alberto Gimeno](https://github.com/gimenete)


## Credits

* [Snow Shoes](http://thenounproject.com/term/snow-shoes/2678/) by Marc Serre from The Noun Project
* [ESKIMO IGLOO](http://www.colourlovers.com/palette/1933518/ESKIMO_IGLOO) (color palette)


## License

[MIT][license-url]


[codeclimate-image]: http://img.shields.io/codeclimate/github/niftylettuce/eskimo.svg?style=flat
[codeclimate-url]: https://codeclimate.com/github/niftylettuce/eskimo
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
[gitter-url]: https://gitter.im/niftylettuce/eskimo
[gitter-image]: http://img.shields.io/badge/chat-online-brightgreen.svg?style=flat
[circleci-image]: https://circleci.com/gh/niftylettuce/eskimo/tree/master.svg?style=svg&circle-token=20c14ca45ebf4bc8b61b70ac2c8734cd34c965bf
[circleci-url]: https://circleci.com/gh/niftylettuce/eskimo/tree/master
