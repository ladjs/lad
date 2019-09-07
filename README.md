<h1 align="center">
  <a href="https://ladjs.github.io/lad/"><img src="media/lad.png" alt="lad" /></a>
</h1>
<div align="center">
  <a href="http://slack.crocodilejs.com"><img src="http://slack.crocodilejs.com/badge.svg" alt="chat" /></a>
  <a href="https://travis-ci.org/ladjs/lad"><img src="https://travis-ci.org/ladjs/lad.svg?branch=master" alt="build status" /></a>
  <a href="https://codecov.io/github/ladjs/lad"><img src="https://img.shields.io/codecov/c/github/ladjs/lad/master.svg" alt="code coverage" /></a>
  <a href="https://github.com/sindresorhus/xo"><img src="https://img.shields.io/badge/code_style-XO-5ed9c7.svg" alt="code style" /></a>
  <a href="https://github.com/prettier/prettier"><img src="https://img.shields.io/badge/styled_with-prettier-ff69b4.svg" alt="styled with prettier" /></a>
  <a href="https://lass.js.org"><img src="https://img.shields.io/badge/made_with-lass-95CC28.svg" alt="made with lass" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/ladjs/lad.svg" alt="license" /></a>
</div>
<br />
<div align="center">
  Lad scaffolds a <a href="http://koajs.com/">Koa</a> webapp and API framework for <a href="https://nodejs.org">Node.js</a>
</div>
<div align="center">
  <sub>
    A lad that fell in love with a <a href="https://lass.js.org"><strong>lass</strong></a>
    &bull; Built by <a href="https://github.com/niftylettuce">@niftylettuce</a>
    and <a href="#contributors">contributors</a>
  </sub>
</div>
<hr />

<div align="center">:heart: Love this project? Support <a href="https://github.com/niftylettuce" target="_blank">@niftylettuce's</a> <a href="https://en.wikipedia.org/wiki/Free_and_open-source_software" target="_blank">FOSS</a> on <a href="https://patreon.com/niftylettuce" target="_blank">Patreon</a> or <a href="https://paypal.me/niftylettuce">PayPal</a> :unicorn:</div>


## Table of Contents

* [Features](#features)
  * [Microservices](#microservices)
  * [Front-end](#front-end)
  * [Back-end](#back-end)
  * [Translation](#translation)
  * [Email Engine](#email-engine)
  * [Error Handling](#error-handling)
  * [Performance](#performance)
  * [Security](#security)
* [Get Started](#get-started)
  * [Requirements](#requirements)
  * [Install](#install)
  * [Usage](#usage)
  * [Configuration](#configuration)
  * [Tutorials](#tutorials)
  * [Community](#community)
* [Architecture](#architecture)
* [Principles](#principles)
* [Related](#related)
* [Contributing](#contributing)
* [Contributors](#contributors)
* [Trademark Notice](#trademark-notice)
* [License](#license)


## Features

Lad boasts dozens of features and is extremely configurable.

### Microservices

These microservices are preconfigured for security, performance, and graceful reloading.

* Webapp server → [web.js](template/web.js)
* API server → [api.js](template/api.js)
* Job scheduler → [agenda.js](template/agenda.js)
* Proxy server → [proxy.js](template/proxy.js)

### Front-end

* Browser linting using [eslint-plugin-compat][] and [browserslist][] (see [.browserslistrc](template/.browserslistrc) for the default config)
* [Pug][] template engine (you can easily use [Moon][], [Vue][], [React][], or [Angular][], though typically [you aren't going to need it][yagni])
* [Gulp][] (latest version 4.x)
* [Sass][]
* [PostCSS][] (with [font-magician][], [import-url][], [font-grabber][], [base64][], and [cssnext][] pre-configured)
* [Bootstrap][]
* [Font Awesome][font-awesome]
* [SpinKit][]
* [SweetAlert2][]
* [Dense][]
* [Waypoints][]
* [LiveReload][]
* [Frisbee][]
* …

### Back-end

* Redis, sessions, and flash messages (both toast and modal messages thanks to [SweetAlert2][])
* Koa-based webapp and API servers
* Pagination built-in (using [ctx-paginate][])
* RESTful API with BasicAuth and versioning
* Automated job scheduler with cron and human-readable syntax (backed by [Mongoose][] and [Agenda][])
* Passport-based authentication and group-based (Unix-like) permissioning
* Stripe-inspired error handling
* Mongoose and MongoDB with common database plugins
* Email template engine with [Nodemailer][] and local rendering
* Proxy eliminates need for Nginx reverse-proxy or Apache virtual hosts
* Multilingual through built-in i18n translation support ([see configuration](#translation-configuration))
* Automatic phrase translation with Google Translate
* Sitemap generator for simple SEO
* …

### Translation

Finally a framework that solves i18n everywhere; complete with automatic translation.

* Translation constants built-in so you [don't repeat yourself][dry]
* Webapp error messages and templates are translated
* Emails are translated
* API responses are translated
* Database errors are translated
* Authentication errors are translated
* …

### Email Engine

Our beautiful email engine uses [email-templates][] (which is also made by the creator of Lad)!

* Test your emails locally with automatic browser-rendering on the fly
* Automatically inlines CSS for cross-browser and cross-platform email client support
* Use [Bootstrap][] in your email template designs
* Reuse your existing CSS and webapp styling
* Use any template engine (defaults to Pug)
* [Render custom fonts in emails with code][custom-fonts-in-emails]
* [Add icons with Font Awesome with code][font-awesome-assets]
* [Automatically avoid email client caching][nodemailer-base64-to-s3]
* Include any image you want and it will be properly rendered
* Rids the need for awkward embedded image CID attachments
* …

### Error Handling

We've spent a lot of time designing a beautiful error handler.

* Supports `text/html`, `application/json`, and `text` response types
* [User-friendly responses](https://github.com/niftylettuce/koa-better-error-handler#user-friendly-responses)
* [HTML error lists](https://github.com/niftylettuce/koa-better-error-handler#html-error-lists)
* …

See [koa-better-error-handler][] for a complete reference.

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
* CORS, SameSite set to "lax" ([an alternative to CSRF][csrf-alternative]), CSRF (since [not all browsers][csrf-caniuse] support SameSite yet) XSS, and rate limited protection
* Dotenv support for environment-based configurations
* App, user, and request-based logging
* SSL-ready (see [instructions below](#ssl-configuration))
* …


## Get Started

We strictly support Mac and Ubuntu-based operating systems (Windows _might_ work).

### Requirements

Please ensure your operating system has the following software installed:

* [Git][] - see [GitHub's tutorial][github-git] for installation

* [Node.js][node] (v8.9.0+) - use [nvm][] to install it on any OS

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
```

#### Development

To begin, try typing `npm start` (or `yarn start`) on command line.  This will display to you all the scripts you can run.

The `start` script (among many others) uses [nps][] and [nps-utils][] under the hood.  This helps to keep scripts very developer-friendly, and rids the need to write in JSON syntax.

This script accepts a `<script>` argument, whereas a script of `all` will spawn, watch, and re-compile all of the [microservices](#microservices) mentioned above.

It will also open the browser for you to <http://localhost:3000> automatically for testing the web front-end.

[npm][]:

```sh
npm start all
```

[yarn][]:

```sh
yarn start all
```

##### Debugging

As similar to running any other [node][] process, simply use the environment variable `DEBUG`:

[npm][]:

```sh
DEBUG=* npm start
```

[yarn][]:

```sh
DEBUG=* yarn start all
```

You can also use `NODE_DEBUG` if desired to debug [node][] internal modules.

```sh
NODE_DEBUG=* ...
```

And also `MONGOOSE_DEBUG` if you'd like Mongoose raw database operation output.

```sh
MONGOOSE_DEBUG=true ...
```

#### Production

We strongly recommend using [SemaphoreCI][], [PM2][], and [Digital Ocean][do] for production deployment.

1. We've provided you with a preconfigured [ecosystem.json](template/ecosystem.json) [deployment file](http://pm2.keymetrics.io/docs/usage/deployment/). You will need to modify this file with your server's IP, hostname, and other metadata if needed.

2. Make sure that your project's assets are built with `NODE_ENV=production` flag, e.g. `NODE_ENV=production npm run build` (or with yarn as `yarn build`);this creates a `build/rev-manifest.json` file per [koa-manifest-rev][].

3. You can test this locally by installing [PM2][] globally with [npm][] or [yarn][], and then running the following command:

   ```sh
   NODE_ENV=production pm2 start
   ```

4. See the [Continuous Integration and Code Coverage](#continuous-integration-and-code-coverage) and [Tutorials](#tutorials) sections below for instructions on how to setup continuous integration, code coverage, and deployment.

5. If you specify an environment variable value for `AWS_CF_DOMAIN` and `NODE_ENV=production` is set then your assets will need to be published to Amazon S3/Cloudfront. To do so run `npm start publish-assets` (or with yarn as `yarn start publish-assets`).  This command automatically sets `NODE_ENV=production` for you as well via `cross-env`.

#### Tests

We use [ava][] and [nyc][] for testing and code coverage.

[npm][]:

```sh
npm test
```

[yarn][]:

```sh
yarn test
```

### Configuration

#### Environment Variables

We have made configuration of your Lad project easy through a [dotenv][] configuration package called [@ladjs/env][lad-env], per [Twelve-Factor][twelve-factor].

We use the following three packages to manage configuration:

* [dotenv-extended][] - allows us to craft a `.env` definition (otherwise known as a "schema") in a file named `.env.schema`
* [mustache][] - allows us to use the [Mustache templating language][mustache] in our `.env` and `.env.defaults` configuration files
* [dotenv-parse-variables][] - automatically parses variable types from `process.env` (e.g. `FOO=4` will set `process.env.FOO = 4` with a `Number` variable type instead of a `String`)

Configuration is managed by the following, in order of priority:

1. Contents of the file at `config/index.js` (reads in `process.env` environment variables)
2. Contents of the files in directories under `config/environments/` (sets defaults per environment, e.g. you can pass `NODE_ENV=staging` and it will load the file at `config/environments/staging.js`)
3. Environment variables used to override defaults or set required ones (e.g. `NODE_ENV=production`)
4. Environment configuration in `.env`
5. Environment configuration in `.env.defaults`

Precedence is taken by the environment configuration files, environment variables, then the `.env` file.

Basically [dotenv][] won't set an environment variable if it already detects it was passed as an environment variable.

Take a look at the [config](template/config) folder contents and also at the defaults at [.env.defaults](template/.env.defaults).

#### SSL Configuration

To configure SSL for the web or API server simply set them in your `.env` file or pass them as environment variables.

> Web server:

* `WEB_PROTOCOL` - you must set this to `https`
* `WEB_SSL_KEY_PATH` - file path to your SSL key file (e.g. `/home/deploy/.ssl/web-key.pem`)
* `WEB_SSL_CERT_PATH` - file path to your SSL certificate file (e.g. `/home/deploy/.ssl/web-cert.pem`)
* `WEB_SSL_CA_PATH` (optional) - file path to your SSL certificate authority file (e.g. `/home/deploy/.ssl/web-ca-cert.pem`)

> API server:

* `API_PROTOCOL` - you must set this to `https`
* `API_SSL_KEY_PATH` - file path to your SSL key file (e.g. `/home/deploy/.ssl/api-key.pem`)
* `API_SSL_CERT_PATH` - file path to your SSL certificate file (e.g. `/home/deploy/.ssl/api-cert.pem`)
* `API_SSL_CA_PATH` (optional) - file path to your SSL certificate authority file (e.g. `/home/deploy/.ssl/api-ca-cert.pem`)

#### Outbound Email Configuration

By default in the development environment we simply render the email in your browser.

However in other environments such as production, you definitely want emails to be sent.

We built-in support for Postmark by default (though you can swap in your own `transport` provider in the `jobs/email.js` file):

1. Go to [https://postmarkapp.com](https://postmarkapp.com?utm_source=lad) – Start Free Trial

2. Create a free trial account, then click Get Started, and proceed to create a "Server" and "Sender Signature"

3. Copy/paste the "Server API token" under "Credentials" in your `.env` file (example below)

   ```diff
   -POSTMARK_API_TOKEN=
   +POSTMARK_API_TOKEN=ac6657eb-2732-4cfd-915b-912b1b10beb1
   ```

4. Modify the `SEND_EMAIL` variable in `.env` from `false` to `true`

#### Favicon and Touch Icon Configuration

You can customize the favicon and touch icons – just generate a new set at <https://realfavicongenerator.net> and overwrite the existing in the [assets](template/assets) folder.

Just make sure that any relative paths match up in the `assets/browserconfig.xml` and `assets/manifest.json` files.

#### Authentication Methods

We use Lad's auth package under the hood; so if you want to configure authentication providers you'll want to read more or contribute to [@ladjs/auth][ladjs-auth].

##### Google Auth

In order to add Google sign-in to your app (so users can log in with their Google account):

1. Go to <https://console.developers.google.com> – Create a project (and fill out your project information – if you need a 120x120px default image, [you can use this one](https://cdn.rawgit.com/ladjs/lad/82d38d64/media/lad-120x120.png) with a CDN path of <https://cdn.rawgit.com/ladjs/lad/82d38d64/media/lad-120x120.png>

2. Under your newly created project, go to Credentials – Create credentials – OAuth client ID – Web application

3. Set "Authorized JavaScript origins" to `http://yourdomain.com` (replace with your domain) and also `http://localhost:3000` (for local development)

4. Set "Authorized redirect URIs" to `http://yourdomain.com/auth/google/ok` (again, replace with your domain) and also `http://localhost:3000/auth/google/ok` (again, for local development)

5. Copy and paste the newly created key pair for respective properties in your `.env` file (example below)

   ```diff
   -GOOGLE_CLIENT_ID=
   +GOOGLE_CLIENT_ID=424623312719-73vn8vb4tmh8nht96q7vdbn3mc9pd63a.apps.googleusercontent.com
   -GOOGLE_CLIENT_SECRET=
   +GOOGLE_CLIENT_SECRET=Oys6WrHleTOksqXTbEY_yi07
   ```

6. In `.env`, make sure that `AUTH_GOOGLE_ENABLED=true` to enable this authentication method.

#### Translation Configuration

1. Go to <https://console.developers.google.com>
2. Enable the Google Translate API
3. Copy your API key and set it as the environment variable `GOOGLE_TRANSLATE_KEY=******`

#### Continuous Integration and Code Coverage

We strongly recommend that you use [SemaphoreCI][] for continuous integration and [Codecov][] for code coverage.

Here are the simple steps required to setup [SemaphoreCI][] with [Codecov][]:

1. Go to [SemaphoreCI][] and sign up for a free account

2. Once your repository is pushed to GitHub, add it as a project on SemaphoreCI

3. Configure your project on SemaphoreCI with the following build settings:

   > Replace `npm` with `yarn` if you're using [yarn][] as your package manager

   * Language: `JavaScript`
   * Node.js version: `8.9.0+` (latest LTS)
     > Note you can also add to `Setup` the script `nvm install latest` to install latest version if SemaphoreCI does not provide it from the drop-down
   * Setup: `npm install`
   * Job 1: `npm run test-coverage`
   * After job: `npm run coverage`

4. Go to [Codecov][] and sign up for a free account

5. Add your project on Codecov and copy to your clipboard the token

6. Go to SemaphoreCI's Project Settings for your project and add `CODECOV_TOKEN` as an environment variable (with the contents from your clipboard)

7. Run a test build ("Rebuild last revision") on SemaphoreCI and check to make sure your code coverage report uploads properly on Codecov

8. Ensure your `README.md` file has the build status and code coverage badges rendered properly (you will need to use a different badge link from each provider if your GitHub repository is private)

#### Amazon S3 and CloudFront Asset Setup

In order for your assets to get properly served in a production environment, you'll need to configure AWS:

1. Go to <https://console.aws.amazon.com/iam/home#security_credential> ‐ Access Keys – Create New Access Key

2. Copy and paste the newly created key pair for respective properties in your `.env` file (example below)

   ```diff
   -AWS_IAM_KEY=
   +AWS_IAM_KEY=AKIAJMH22P6W674YFC7Q
   -AWS_IAM_SECRET=
   +AWS_IAM_SECRET=9MpR1FOXwPEtPlrlU5WbHjnz2KDcKWSUcB+C5CpS
   ```

3. Enable your API by clicking on Overview and then clicking the Enable button

4. Go to <https://console.aws.amazon.com/s3/home> – Create Bucket

5. Create a bucket and copy/paste its name for the property in `.env` (example below)

   ```diff
   -AWS_S3_BUCKET=
   +AWS_S3_BUCKET=lad-development
   ```

6. Go to <https://console.aws.amazon.com/cloudfront/home> – Create Distribution – Get Started

7. Set "Origin Domain Name" equal to your S3 bucket name (their autocomplete drop-down will help you find it)

8. Leave the remaining defaults as is (some fields might be blank, this is OK)

9. Copy/paste the newly created Distribution ID and Domain Name for respective properties in your `.env` file (example below)

   ```diff
   -AWS_CF_DI=
   +AWS_CF_DI=E2IBEULE9QOPVE
   -AWS_CF_DOMAIN=
   +AWS_CF_DOMAIN=d36aditw73gdrz.cloudfront.net
   ```

### Tutorials

* [Writing Your App](https://github.com/koajs/koa#getting-started)
* [Continous Integration and Deployment](http://niftylettuce.com/posts/automated-node-app-ci-graceful-zerodowntime-github-pm2/)

### Community

* [Follow us on Twitter][twitter]
* [Join our Slack channel][slack]
* [Subscribe to our Twitch channel][twitch]
* [Visit Koa's Community section](https://github.com/koajs/koa#community).
* [Join Mongoose's Slack channel][mongoose-slack]


## Architecture

The following bash output is the directory structure and organization of Lad:

```sh
tree template -I "build|node_modules|coverage|test"
```

```sh
template
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
│   │   ├── mstile-150x150.png
│   │   └── social.png
│   ├── js
│   │   ├── admin
│   │   │   └── dashboard.js
│   │   ├── ajax-form.js
│   │   ├── change-hash-on-scroll.js
│   │   ├── clipboard.js
│   │   ├── core.js
│   │   ├── custom-file-input.js
│   │   ├── facebook-hash-fix.js
│   │   ├── flash.js
│   │   ├── jump-to.js
│   │   ├── return-to.js
│   │   ├── spinner.js
│   │   └── swal.js
│   └── manifest.json
├── config
│   ├── env.js
│   ├── environments
│   │   ├── development.js
│   │   ├── index.js
│   │   ├── production.js
│   │   ├── staging.js
│   │   └── test.js
│   ├── index.js
│   ├── meta.js
│   ├── phrases.js
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
├── env
├── gitignore
├── gulpfile.js
├── helpers
│   ├── i18n.js
│   ├── index.js
│   ├── logger.js
│   └── policies.js
├── jobs
│   ├── email.js
│   └── index.js
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


## Principles

Lad is designed according to these principles:

1. Always be developer-friendly
2. Adhere to [MVC][], [Unix][], [KISS][], [DRY][], [YAGNI][] and [Twelve Factor][twelve-factor]
3. Target the scrappy, bootstrapped, and [ramen-profitable][] hacker


## Related

* [lipo][] - Free image manipulation API service built on top of [Sharp][]
* [cabin][] - Logging and analytics solution for [Node.js][node], [Lad][], [Koa][], and [Express][]
* [lass][] - Scaffold a modern boilerplate for [Node.js][node]


## Contributing

Interesting in contributing to this project or testing early releases?

1. Follow all of the above [Requirements](#requirements)
2. You will need to fork and clone this repository locally
3. After forking, follow these steps:

   ```sh
   cd lad
   yarn install
   cd template
   yarn install
   yarn start
   ```

If you'd like to preview changes to the `README.md` file, you can use `docute`.

```sh
yarn global add docute-cli
cd lad
docute ./
```

Then visit <http://localhost:8080> in your browser.


## Contributors

| Name           | Website                   |
| -------------- | ------------------------- |
| **Nick Baugh** | <http://niftylettuce.com> |


## Trademark Notice

Lad, Lass, Cabin, Lipo, and their respective logos are trademarks of Niftylettuce LLC.
These trademarks may not be reproduced, distributed, transmitted, or otherwise used, except with the prior written permission of Niftylettuce LLC.
If you are seeking permission to use these trademarks, then please [contact us](mailto:niftylettuce@gmail.com).


## License

[MIT](LICENSE) © [Nick Baugh](http://niftylettuce.com)


## 

<a href="#"><img src="media/lad-footer.png" alt="#" /></a>

[npm]: https://www.npmjs.com/

[yarn]: https://yarnpkg.com/

[lass]: https://lass.js.org

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

[codecov]: https://codecov.io/gh

[nodemailer-base64-to-s3]: https://github.com/ladjs/nodemailer-base64-to-s3

[custom-fonts-in-emails]: https://github.com/ladjs/custom-fonts-in-emails

[font-awesome-assets]: https://github.com/ladjs/font-awesome-assets

[nodemailer]: https://nodemailer.com/

[email-templates]: https://github.com/niftylettuce/node-email-templates

[mustache]: https://github.com/janl/mustache.js/

[dotenv-extended]: https://github.com/niftylettuce/node-dotenv-extended

[dotenv-parse-variables]: https://github.com/niftylettuce/dotenv-parse-variables

[dotenv]: https://github.com/motdotla/dotenv

[koa-better-error-handler]: https://github.com/niftylettuce/koa-better-error-handler

[koa-manifest-rev]: https://github.com/niftylettuce/koa-manifest-rev

[cabin]: http://cabinjs.com

[lad]: https://lad.js.org

[koa]: http://koajs.com/

[mongoose]: http://mongoosejs.com

[agenda]: http://agendajs.com

[ladjs-auth]: https://github.com/ladjs/auth

[csrf-alternative]: https://scotthelme.co.uk/csrf-is-dead/

[csrf-caniuse]: https://caniuse.com/#search=SameSite

[dry]: https://en.wikipedia.org/wiki/Don%27t_repeat_yourself

[lipo]: https://lipo.io

[sharp]: http://sharp.dimens.io/

[express]: https://expressjs.com

[ctx-paginate]: https://github.com/koajs/ctx-paginate

[sweetalert2]: https://limonte.github.io/sweetalert2/

[nps]: https://github.com/kentcdodds/nps

[nps-utils]: https://github.com/kentcdodds/nps-utils

[eslint-plugin-compat]: https://github.com/amilajack/eslint-plugin-compat

[browserslist]: https://github.com/ai/browserslist

[pug]: https://pugjs.org

[gulp]: https://gulpjs.com

[sass]: http://sass-lang.com/

[postcss]: http://postcss.org/

[bootstrap]: https://getbootstrap.com/

[font-awesome]: http://fontawesome.io/

[spinkit]: http://tobiasahlin.com/spinkit/

[dense]: http://dense.rah.pw/

[waypoints]: http://imakewebthings.com/waypoints/

[livereload]: https://github.com/intesso/connect-livereload

[frisbee]: https://github.com/niftylettuce/frisbee

[lad-env]: https://github.com/ladjs/env

[font-magician]: https://github.com/jonathantneal/postcss-font-magician

[import-url]: https://github.com/unlight/postcss-import-url

[font-grabber]: https://github.com/AaronJan/postcss-font-grabber

[base64]: https://github.com/jelmerdemaat/postcss-base64

[cssnext]: http://cssnext.io/
