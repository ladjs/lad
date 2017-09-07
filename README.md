<h1 align="center">
  <a href="https://ladjs.github.io/lad/"><img src="media/lad.png" alt="lad" /></a>
</h1>
<div align="center">
  <a href="http://slack.crocodilejs.com"><img src="http://slack.crocodilejs.com/badge.svg" alt="chat" /></a>
  <a href="https://semaphoreci.com/niftylettuce/lad"><img src="https://semaphoreci.com/api/v1/niftylettuce/lad/branches/master/shields_badge.svg" alt="build status"></a>
  <a href="https://codecov.io/github/ladjs/lad"><img src="https://img.shields.io/codecov/c/github/ladjs/lad/master.svg" alt="code coverage" /></a>
  <a href="https://github.com/sindresorhus/xo"><img src="https://img.shields.io/badge/code_style-XO-5ed9c7.svg" alt="code style" /></a>
  <a href="https://github.com/prettier/prettier"><img src="https://img.shields.io/badge/styled_with-prettier-ff69b4.svg" alt="styled with prettier" /></a>
  <a href="https://github.com/lassjs/lass"><img src="https://img.shields.io/badge/made_with-lass-95CC28.svg" alt="made with lass" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/ladjs/lad.svg" alt="license" /></a>
</div>
<br />
<div align="center">
  Lad scaffolds a <a href="http://koajs.com/">Koa</a> webapp and API framework for <a href="https://nodejs.org">Node</a>
</div>
<div align="center">
  <sub>
    A lad that fell in love with a <a href="https://github.com/lassjs/lass"><strong>lass</strong></a>
    &bull; Built by <a href="https://github.com/niftylettuce">@niftylettuce</a>
    and <a href="#contributors">contributors</a>
  </sub>
</div>
<hr />
<div align="center"><strong>Lad is in alpha development, please <a href="http://slack.crocodilejs.com">join our Slack channel</a> to learn more</strong></div>
<hr />


## Table of Contents

* [Philosophy](#philosophy)
* [Features](#features)
  * [Microservices](#microservices)
  * [Frontend](#frontend)
  * [Backend](#backend)
  * [Localization](#localization)
  * [Email Engine](#email-engine)
  * [Performance](#performance)
  * [Security](#security)
* [Architecture](#architecture)
* [Get Started](#get-started)
  * [Requirements](#requirements)
  * [Install](#install)
  * [Usage](#usage)
  * [Continuous Integration and Code Coverage](#continuous-integration-and-code-coverage)
  * [Tutorials](#tutorials)
  * [Community](#community)
* [Related](#related)
* [Contributors](#contributors)
* [Trademark Notice](#trademark-notice)
* [License](#license)


## Philosophy

> Lad is designed according to three core beliefs.

1. Adhere to [MVC][], [Unix][], [KISS][], [YAGNI][] and [Twelve Factor][twelve-factor] principles
2. Design for a scrappy, bootstrapped, and [ramen-profitable][] hacker
3. Stay simple, modern, lightweight, stellar, highly-configurable, and developer-friendly


## Features

Lad boasts dozens of features and is extremely configurable.

### Microservices

> These microservices are preconfigured for security, performance, and graceful reloading.

* Webapp server → [web.js](template/web.js)
* API server → [api.js](template/api.js)
* Job server → [agenda.js](template/agenda.js)
* Proxy server → [proxy.js](template/proxy.js)

### Frontend

> You can easily add [Moon][], [Vue][], [React][], or [Angular][], though typically [you aren't going to need it][yagni].

* Use any template engine (defaults to Pug)
* Bootstrap 4
* Font Awesome
* SpinKit
* SweetAlert2
* Dense
* Waypoints
* LiveReload
* Frisbee
* …

### Backend

* Redis, sessions, and flash messaging
* Koa-based webapp and API servers
* RESTful API with BasicAuth and versioning
* Agenda-based job scheduler with cron and human-readable syntax
* Passport-based authentication and group-based (Unix-like) permissioning
* Stripe-inspired error handling with Boom
* Mongoose and MongoDB with common database plugins
* Email template engine with Nodemailer and local rendering
* Proxy eliminates need for Nginx reverse-proxy or Apache virtual hosts
* Multilingual through i18n and i10n
* Automatic phrase translation with Google Translate
* Sitemap generator for simple SEO
* …

### Localization

> Finally a framework that solves i18n and i10n everywhere; complete with automatic translation.

* Webapp messages and templates are localized
* Emails are localized
* API responses are localized
* Database errors are localized
* Authentication errors are localized
* …

### Email Engine

> Our beautiful email engine is built on top of [Nodemailer][] and designed by the creator of [email-templates][].

* Test your emails locally with automatic browser-rendering on the fly
* Automatically inlines CSS for cross-browser and cross-platform email client support
* Use Bootstrap in your email template designs
* Reuse your existing CSS and webapp styling
* Use any template engine (defaults to Pug)
* [Render custom fonts in emails with code][custom-fonts-in-emails]
* [Add icons with Font Awesome with code][font-awesome-assets]
* [Automatically avoid email client caching][nodemailer-base64-to-s3]
* Include any image you want and it will be properly rendered
* Rids the need for awkward embedded image CID attachments
* …

### Performance

* Compression and zero-bloat approach
* Stream-based file uploading
* Graceful reloading, shutdown, and reconnection handling
* Manifest asset revisioning
* Amazon S3 and CloudFront ready
* …

### Security

* Database security plugins and helpers
* Automated tests and code coverage
* CORS, CSRF, XSS, and rate limited protection
* Dotenv support for environment-based configurations
* App, user, and request-based logging
* SSL-ready
* …


## Architecture

> The following bash output is the directory structure and organization of Lad:

```sh
tree template -I "build|node_modules|coverage"
```

```sh
.
├── LICENSE
├── README
├── agenda.js
├── api.js
├── app
│   ├── controllers
│   │   ├── api
│   │   │   ├── index.js
│   │   │   └── v1
│   │   │       ├── index.js
│   │   │       └── users.js
│   │   ├── index.js
│   │   └── web
│   │       ├── auth.js
│   │       ├── contact.js
│   │       └── index.js
│   ├── models
│   │   ├── index.js
│   │   ├── inquiry.js
│   │   ├── job.js
│   │   ├── plugins
│   │   │   ├── common.js
│   │   │   ├── index.js
│   │   │   └── slug.js
│   │   └── user.js
│   └── views
│       ├── 404.pug
│       ├── 500.pug
│       ├── _footer.pug
│       ├── _nav.pug
│       ├── _pagination.pug
│       ├── about.pug
│       ├── admin.pug
│       ├── contact.pug
│       ├── forgot-password.pug
│       ├── home.pug
│       ├── layout.pug
│       ├── my-account.pug
│       ├── reset-password.pug
│       ├── signup-or-login.pug
│       ├── spinner
│       │   ├── 1.pug
│       │   ├── 10.pug
│       │   ├── 11.pug
│       │   ├── 2.pug
│       │   ├── 3.pug
│       │   ├── 4.pug
│       │   ├── 5.pug
│       │   ├── 6.pug
│       │   ├── 7.pug
│       │   ├── 8.pug
│       │   ├── 9.pug
│       │   └── spinner.pug
│       └── terms.pug
├── assets
│   ├── browserconfig.xml
│   ├── css
│   │   ├── _custom.scss
│   │   ├── _email.scss
│   │   ├── _hljs-github.scss
│   │   ├── _variables.scss
│   │   └── app.scss
│   ├── fonts
│   │   └── GoudyBookletter1911.otf
│   ├── img
│   │   ├── android-chrome-192x192.png
│   │   ├── android-chrome-384x384.png
│   │   ├── apple-touch-icon.png
│   │   ├── favicon-16x16.png
│   │   ├── favicon-32x32.png
│   │   ├── favicon.ico
│   │   └── mstile-150x150.png
│   ├── js
│   │   ├── admin
│   │   │   └── dashboard.js
│   │   ├── core.js
│   │   ├── flash.js
│   │   └── spinner.js
│   └── manifest.json
├── config
│   ├── environments
│   │   ├── development.js
│   │   ├── index.js
│   │   ├── production.js
│   │   ├── staging.js
│   │   └── test.js
│   ├── i18n.js
│   ├── index.js
│   ├── locales.js
│   ├── meta.js
│   └── utilities.js
├── ecosystem.json
├── emails
│   ├── _content.pug
│   ├── _footer.pug
│   ├── _header.pug
│   ├── _nav.pug
│   ├── inquiry
│   │   ├── html.pug
│   │   └── subject.pug
│   ├── layout.pug
│   ├── reset-password
│   │   ├── html.pug
│   │   └── subject.pug
│   └── welcome
│       ├── html.pug
│       └── subject.pug
├── gitignore
├── gulpfile.js
├── helpers
│   ├── _404-handler.js
│   ├── context-helpers.js
│   ├── dynamic-view-helpers.js
│   ├── graceful.js
│   ├── i18n.js
│   ├── index.js
│   ├── logger.js
│   ├── meta.js
│   ├── mongoose.js
│   ├── passport.js
│   ├── policies.js
│   ├── render-page.js
│   ├── stop-agenda.js
│   ├── store-ip-address.js
│   └── timeout.js
├── index.js
├── jobs
│   ├── email.js
│   ├── index.js
│   └── locales.js
├── locales
│   ├── README.md
│   ├── en.json
│   ├── es.json
│   └── zh.json
├── nodemon.json
├── package.json
├── proxy.js
├── routes
│   ├── api
│   │   ├── index.js
│   │   └── v1
│   │       └── index.js
│   ├── index.js
│   └── web
│       ├── admin.js
│       ├── auth.js
│       └── index.js
├── web.js
└── yarn.lock
```


## Get Started

> We strictly support Mac and Ubuntu-based operating systems (Windows _might_ work).

### Requirements

Please ensure your operating system has the following software installed:

* [Git][] - see [GitHub's tutorial][github-git] for installation

* [Sharp][] - we use this for image transformation (e.g. an avatar file upload needs resized)

  * Mac (via [brew][]): `brew install homebrew/science/vips --with-webp --with-graphicsmagick` (as of [sharp][] v0.18.2 this is required)
  * Ubuntu/Windows - should work out of the box

* [Node.js][node] (v8.x+) - use [nvm][] to install it on any OS

  * After installing `nvm` you will need to run `nvm install node`
  * We also recommend you install [yarn][], which is an alternative to [npm][]

* [MongoDB][] (v3.x+):

  * Mac (via [brew][]): `brew install mongodb && brew services start mongo`
  * Ubuntu:

    ```sh
    sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 0C49F3730359A14518585931BC711F9BA15703C6
    echo "deb http://repo.mongodb.org/apt/ubuntu "$(lsb_release -sc)"/mongodb-org/3.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.4.list
    sudo apt-get update
    sudo apt-get -y install mongodb-org
    ```

* [Redis][] (v4.x+):

  * Mac (via [brew][]): `brew install redis && brew services start redis`
  * Ubuntu:

    ```sh
    sudo add-apt-repository -y ppa:chris-lea/redis-server
    sudo apt-get update
    sudo apt-get -y install redis-server
    ```

### Install

[npm][]:

```sh
npm install -g lad
```

[yarn][]:

```sh
yarn global add lad
```

### Usage

#### Create a project

```sh
lad new-project
cd new-project
cp .env.defaults .env
```

#### Development

> The `start` script will spawn, watch, and re-compile all of the [microservices](#microservices) mentioned above.

[npm][]:

```sh
npm start
```

[yarn][]:

```sh
yarn start
```

#### Production

> We strongly recommend using [SemaphoreCI][], [PM2][], and [Digital Ocean][do] for production deployment.

1. We've provided you with a preconfigured [ecosystem.json](template/ecosystem.json) [deployment file](http://pm2.keymetrics.io/docs/usage/deployment/). You will need to modify this file with your server's IP, hostname, and other metadata if needed.

2. You can test this locally by installing [PM2][] globally with [npm][] or [yarn][], and then running the following command:

   ```sh
   pm2 start
   ```

3. See the [Continuous Integration and Code Coverage](#continuous-integration-and-code-coverage) and [Tutorials](#tutorials) sections below for instructions on how to setup continuous integration, code coverage, and deployment.

#### Tests

> We use [ava][] and [nyc][] for testing and code coverage.

[npm][]:

```sh
npm test
```

[yarn][]:

```sh
yarn test
```

### Continuous Integration and Code Coverage

> We strongly recommend that you use [SemaphoreCI][] for continuous integration and [Codecov][] for code coverage.

Here are the simple steps required to setup [SemaphoreCI][] with [Codecov][]:

1. Go to [SemaphoreCI][] and sign up for a free account
2. Once your repository is pushed to GitHub, add it as a project on SemaphoreCI
3. Configure your project on SemaphoreCI with the following build settings:

   > Replace `npm` with `yarn` if you're using [yarn][] as your package manager

   * Language: `JavaScript`
   * Node.js version: `8.x` (latest)
   * Setup: `npm install`
   * Job 1: `npm test`
   * After job: `npm run coverage`

4. Go to [Codecov][] and sign up for a free account
5. Add your project on Codecov and copy to your clipboard the token
6. Go to SemaphoreCI's Project Settings for your project and add `CODECOV_TOKEN` as an environment variable (with the contents from your clipboard)
7. Run a test build ("Rebuild last revision") on SemaphoreCI and check to make sure your code coverage report uploads properly on Codecov
8. Ensure your `README.md` file has the build status and code coverage badges rendered properly (you will need to use a different badge link from each provider if your GitHub repository is private)

### Tutorials

* [Writing Your App](https://github.com/koajs/koa#getting-started)
* [Continous Integration and Deployment](http://niftylettuce.com/posts/automated-node-app-ci-graceful-zerodowntime-github-pm2/)

### Community

* [Follow us on Twitter][twitter]
* [Join our Slack channel][slack]
* [Subscribe to our Twitch channel][twitch]
* [Visit Koa's Community section](https://github.com/koajs/koa#community).
* [Join Mongoose's Slack channel][mongoose-slack]
* [Join Agenda's Slack channel][agenda-slack]


## Related

* [lass][] - Scaffold a modern boilerplate for [Node.js][node]


## Contributors

| Name           | Website                   |
| -------------- | ------------------------- |
| **Nick Baugh** | <http://niftylettuce.com> |


## Trademark Notice

Lad, Lass, and their respective logos are trademarks of Niftylettuce LLC.
These trademarks may not be reproduced, distributed, transmitted, or otherwise used, except with the prior written permission of Niftylettuce LLC.
If you are seeking permission to use these trademarks, then please [contact us](mailto:niftylettuce@gmail.com).


## License

[MIT](LICENSE) © [Nick Baugh](http://niftylettuce.com)


##

<a href="#"><img src="media/lad-footer.png" alt="#" /></a>

[npm]: https://www.npmjs.com/

[yarn]: https://yarnpkg.com/

[lass]: https://github.com/lassjs/lass

[node]: https://nodejs.org

[kiss]: https://en.wikipedia.org/wiki/KISS_principle

[mvc]: https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller

[yagni]: https://en.wikipedia.org/wiki/You_aren%27t_gonna_need_it

[twelve-factor]: https://12factor.net/

[ramen-profitable]: http://www.paulgraham.com/ramenprofitable.html

[unix]: https://en.wikipedia.org/wiki/Unix_philosophy

[nvm]: https://github.com/creationix/nvm

[mongodb]: https://www.mongodb.com/

[redis]: https://redis.io/

[github-git]: https://help.github.com/articles/set-up-git/

[sharp]: http://sharp.dimens.io/en/stable/

[git]: https://git-scm.com/

[slack]: http://slack.crocodilejs.com/

[brew]: https://brew.sh/

[twitter]: https://twitter.com/niftylettuce

[twitch]: https://www.twitch.tv/niftylettuce

[moon]: https://github.com/kbrsh/moon

[vue]: https://vuejs.org/

[react]: https://facebook.github.io/react/

[angular]: https://angular.io/

[pm2]: http://pm2.keymetrics.io/

[do]: https://m.do.co/c/a7fe489d1b27

[semaphoreci]: https://semaphoreci.com/?ref=lad

[ava]: https://github.com/avajs/ava

[nyc]: https://github.com/istanbuljs/nyc

[mongoose-slack]: http://slack.mongoosejs.io/

[agenda-slack]: https://slackin-ekwifvcwbr.now.sh/

[codecov]: https://codecov.io/gh

[nodemailer-base64-to-s3]: https://github.com/crocodilejs/nodemailer-base64-to-s3

[custom-fonts-in-emails]: https://github.com/crocodilejs/custom-fonts-in-emails

[font-awesome-assets]: https://github.com/crocodilejs/font-awesome-assets

[nodemailer]: https://nodemailer.com/

[email-templates]: https://github.com/niftylettuce/node-email-templates
