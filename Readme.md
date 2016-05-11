
[![Glazed Logo][glazed-logo]][glazed-url]
# [![Glazed is a highly opinionated, yet simple Node + Koa MVC app framework for rapidly building MVP's.][glazed-description]][glazed-url]</h1>
[![Slack Status][slack-image]][slack-url]
[![MIT License][license-image]][license-url]
[![Stability][stability-image]][stability-url]
[![Build Status][build-image]][build-url]
[![Test Coverage][codecov-image]][codecov-url]
[![Standard JS Style][standard-image]][standard-url]


> **tldr;** Freshly baked [Node][nodejs] + [Koa][koa], [MVC][mvc] app ~~framework~~ boilerplate for [rapidly building MVP's][rapid-mvp]

![Glazed Dependencies][glazed-dependencies]

> **Tip:** While reading, you can click the Glazed logo in section headers to jump back to this index.

## [![glazed-logo-xs]](#-index) [Index](#-index)
* [What is Glazed?](#-what-is-glazed)
  - [Thoughts](#thoughts)
  - [Showcase](#showcase)
  - [App Structure](#app-structure)
  - [Back-end with Koa + Async/Await](#back-end-with-koa-async--await)
  - [Front-end with jQuery + Bootstrap](#front-end-with-jquery--bootstrap)
  - [Job Scheduler](#job-scheduler)
  - [Database &amp; ORM](#database--orm)
  - [Sessions &amp; Auth](#sessions--auth)
  - [Security](#security)
  - [Helpers](#helpers)
* [Why should I use it?](#-why-should-i-use-it)
  - [Best Practices](#best-practices)
  - [Latest Standards](#latest-standards)
  - [LiveReload Built-in](#livereload-built-in)
  - [Production Ready](#production-ready)
  - [Cross-browser Compatibility](#cross-browser-compatibility)
  - [Built-in User Group Permissioning](#built-in-user-group-permissioning)
  - [Search Engine Indexing](#search-engine-indexing)
  - [l18n Localization](#l18n-localization)
  - [Performance](#performance)
* [How do I use it?](#-how-do-i-use-it)
  - [Requirements](#requirements)
  - [Installation](#installation)
  - [Configuration](#configuration)
    * [How does configuration work?](#how-does-configuration-work)
    * [How do I configure my app to boot?](#how-do-i-configure-my-app-to-boot)
  - [Development](#development)
  - [Deployment](#deployment)
  - [Advice](#advice)
  - [Tools](#tools)
* [Is there a book on Glazed?](#-is-there-a-book-on-glazed)
* [Can I get help?](#-can-i-get-help)
* [How do I get updates?](#-how-do-i-get-updates)
* [Who built it?](#-who-built-it)
* [Can we hire @glazed?](#-can-we-hire-glazed)
* [Licensing](#-licensing)


## [![glazed-logo-xs]](#-index) [What is Glazed?](#-what-is-glazed)

Glazed is an application ~~framework~~ boilerplate for rapid iteration of a minimal viable product.

### Thoughts

Glazed was designed to prove the viability of an idea as quick as possible,
with sheer simplicity, and extremely ambitious quality level.  It uses the [latest standards](#latest-standards),
[best practices](#best-practices), and is [production ready](#production-ready).

For example, Glazed can be used to release prototypes of the following in less than 30 days:

* Functional web app for ordering food online
* RESTful API for a React Native iOS/Android app for online food delivery

Glazed is more of a "boilerplate" than a "framework".  It's often called a framework
because of keyword search popularity and the confusion between the two words.
It has a very minimal codebase, which was written with ES6/ES7 (yes, it uses
the new [Async/Await][async-await] syntax!) &ndash; and it was structured
according to some loose thoughts on an MVC approach.

![SPA Framework][spa-image]

**Glazed does not use single page app** ("SPA") client-side library, and does not use any special
client-side framework by default (other than jQuery; though it can easily be changed to a SPA).
The reason it does not use a SPA library, such as [React][react] or [Angular][angular],
is because most (probably?) of software as a service start-ups (and API's in general) don't need something this fancy to start (API's don't even need a SPA).
Using SPA frameworks _will_ and _have_ made proving the viability of an idea take even longer than it already should.
Instead, **Glazed uses the extremely powerful and fast rendering template language called [Nunjucks][nunjucks]**.
In order to render it with Koa, we use [koa-nunjucks-promise][koa-nunjucks-promise].

[![Fake Grimlock][avc-chicken-image]][fake-grimlock]

Before diving into the structure and how it works, it is important to share
that Glazed is _highly opinionated_ and **may not be for you**.  If you are not
comfortable or do not agree with the ideas shared in these articles, then perhaps
you should not read any further into Glazed, and close this browser tab.

1. [Rapid MVP Standards][rapid-mvp] by [@niftylettuce][nifty-twitter]
2. [Frameworks don't make much sense][frameworks-dont-make-sense] by [@pkrumins][pkrumins]
3. [Do Things that Don't Scale][dont-scale] by [@paulg][pg-twitter]

### Showcase

> Did you ship a project with Glazed?  [File an issue](/issues) and we'll include it!.

To get you excited about using Glazed, here are projects built with it in less than a week each:

* [Standard Signature][standard-signature] - Custom Business Email Signatures for Gmail
* [Prove][prove] - Simple Phone Verification Service
* [Wakeup.io][wakeup] - Wake-up Call Service

Its parent framework "Eskimo" was used to ship [some very cool projects][eskimo-ship] too!

### App Structure

Glazed is loosely-based on MVC design, and it has the following structure (`tree` output below):

```log
.
├── History.md
├── LICENSE
├── Readme.md
├── VERSION
├── gulpfile.babel.js
├── package.json
├── .env.example
├── src
│   ├── app
│   │   ├── controllers
│   │   │   ├── app
│   │   │   │   └── index.js
│   │   │   └── index.js
│   │   ├── models
│   │   │   ├── plugins
│   │   │   │   └── common.js
│   │   │   └── user.js
│   │   └── views
│   │       ├── 404.html
│   │       ├── 500.html
│   │       ├── _footer.html
│   │       ├── _nav.html
│   │       ├── about.html
│   │       ├── admin.html
│   │       ├── home.html
│   │       ├── layout.html
│   │       └── my-account.html
│   ├── assets
│   │   ├── browserconfig.xml
│   │   ├── css
│   │   │   ├── _variables.scss
│   │   │   └── app.scss
│   │   ├── favicon.ico
│   │   ├── fonts
│   │   ├── img
│   │   │   ├── android-chrome-144x144.png
│   │   │   ├── android-chrome-192x192.png
│   │   │   ├── android-chrome-36x36.png
│   │   │   ├── android-chrome-48x48.png
│   │   │   ├── android-chrome-72x72.png
│   │   │   ├── android-chrome-96x96.png
│   │   │   ├── apple-touch-icon-114x114.png
│   │   │   ├── apple-touch-icon-120x120.png
│   │   │   ├── apple-touch-icon-144x144.png
│   │   │   ├── apple-touch-icon-152x152.png
│   │   │   ├── apple-touch-icon-180x180.png
│   │   │   ├── apple-touch-icon-57x57.png
│   │   │   ├── apple-touch-icon-60x60.png
│   │   │   ├── apple-touch-icon-72x72.png
│   │   │   ├── apple-touch-icon-76x76.png
│   │   │   ├── apple-touch-icon-precomposed.png
│   │   │   ├── apple-touch-icon.png
│   │   │   ├── favicon-16x16.png
│   │   │   ├── favicon-194x194.png
│   │   │   ├── favicon-32x32.png
│   │   │   ├── favicon-96x96.png
│   │   │   ├── mstile-144x144.png
│   │   │   ├── mstile-150x150.png
│   │   │   ├── mstile-310x150.png
│   │   │   ├── mstile-310x310.png
│   │   │   ├── mstile-70x70.png
│   │   │   └── safari-pinned-tab.svg
│   │   ├── js
│   │   │   └── flash.js
│   │   └── manifest.json
│   ├── config
│   │   ├── environments
│   │   │   ├── development.js
│   │   │   ├── index.js
│   │   │   ├── production.js
│   │   │   ├── staging.js
│   │   │   └── test.js
│   │   └── index.js
│   ├── helpers
│   │   ├── dynamic-view-helpers.js
│   │   ├── error-handler.js
│   │   ├── index.js
│   │   ├── passport.js
│   │   ├── policies.js
│   │   ├── render-page.js
│   │   └── sentry.js
│   ├── index.js
│   └── routes
│       └── index.js
└── test
    ├── mocha.opts
    ├── support
    │   └── index.js
    └── unit
        └── server.test.js
```

### Back-end with Koa + Async/Await

We use Koa for the back-end, and if you previously used [Express][express], you might want to understand the differences; [see this article][koa-vs-express].

To rid of [callback hell][callback-hell], we use a new JavaScript language feature called Async/Await.

For example, here are two blocks of code that compare before and after...

> This is how one might write a Mongoose save with callbacks:

```js
// find the user that belongs to the @glazed organization
// and make their user group have "admin" status
function updateUser(req, res, next) {
  Users.findOne({ org: 'glazed' }, function(err, user) {
    if (err) return next(err);
    if (!user) return next(new Error('User does not exist'));
    user.group = 'admin';
    user.save(function(err, user) {
      if (err) return next(err);
      res.json(user);
    });
  });
}
```

> This is how one might write a Mongoose save with Async/Await:

```js
// find the user that belongs to the @glazed organization
// and make their user group have "admin" status
static async updateUser(ctx) {
  let user = await User.findOne({ org: 'glazed' });
  user.group = 'admin';
  ctx.body = await user.save();
}
```

> Glazed has custom built-in error handling &ndash; so actually you don't even need to wrap the Async/Await function with a `try {} catch (e) {}` statement &ndash; but be careful, because in other cases you might want to!

Other scenarios where Async/Await is resourceful:

* Populating database references cleanly
* Complex find, search, or querying in general
* Less indentation = more readable code
* No more callbacks = more readable code
* Less indentation = code wrapping to 80 characters is easy

### Front-end with jQuery + Bootstrap

By default, the [latest Bootstrap version 4 alpha][bootstrap-4-alpha] is used (it uses SCSS for its CSS pre-processor).

However, you can swap out Bootstrap to another version, or entirely for something else.  You can also switch SCSS to use LESS or plain CSS.

Also included are the front-end packages jQuery and [Sweetalert][sweetalert].

**You don't need Bower anymore**, since you can simply import libraries through our Browserify setup!

### Job Scheduler

For job scheduling, we recommend to use [Agenda][agenda].  In the next release, we will hopefully have included the custom job scheduler (written with Agenda) for Glazed.

### Database &amp; ORM

[MongoDB][mongodb] and [Mongoose][mongoose] are built in, but you can swap them out with your preferred database and ORM glue.  If you need help setting up [Postgres][pg] and [Bookshelf][bookshelf], then we suggest you to change your mind!  It will slow you down &ndash; but if you insist, we can put you in the right direction.

To ~~better~~ beautify validation error messages we use [mongoose-beautiful-unique-validation][mongoose-beautiful-unique-validation]

To enhance security and allow you to have selective JSON output from query results (e.g. never return a user's `refresh_token`, `access_token`, `hash`, or `password` fields) we use [mongoose-json-select][mongoose-json-select].

> We automatically strip the default provided tokens/hash/password fields from JSON output, don't worry!  See the default user model in `app/models/user.js` for insight.

### Sessions &amp; Auth

[Redis][redis] and [Passport][passport] are used for session storage and authentication.

Out of the box, we provide (2) means of authentication for restricted routes:

1. Google OAuth Strategy - uses [passport-google-oauth][passport-google-oauth] (your users can "Log in with Google")
2. Glazed API token - an `api_token` field is populated for each user in the database after their first log-in, and this can be passed as the `user` in `user:pass` with BasicAuth headers &ndash; password is blank for simplicity).  This is very useful for API access if you are building an iOS/Android or client-side focused app

> If you need to add additional strategies, you can literally clone the Google Strategy code and use another [passport package][passport-package] for your auth provider.  Don't be afraid to [join our Slack channel][slack-url] and ask us for help!

### Security

With respect to security, we support the following out of the box:

* [koa-helmet][koa-helmet] - defaults are used, including:
  - [dnsPrefetchControl][dns-prefetch] controls browser DNS prefetching
  - [frameguard][frameguard] to prevent clickjacking
  - [hidePoweredBy][poweredby] to remove the X-Powered-By header
  - [hsts][hsts] for HTTP Strict Transport Security
  - [ieNoOpen][ienoopen] sets X-Download-Options for IE8+
  - [noSniff][nosniff] to keep clients from sniffing the MIME type
  - [xssFilter][xssfilter] adds some small XSS protections
* [koa-ratelimit][koa-ratelimit] - prevent bots and hackers from infinitely brute-forcing routes

### Helpers

Glazed uses the following helper libraries:

* [boom][boom] - HTTP-friendly error objects
* [chalk][chalk] - colorful output
* [chalkline][chalkline] - easily debug with a huge chalkline in your terminal
* [dotenv][dotenv] - management of dotfiles (your environment configurations)
* [frisbee][frisbee] - an API wrapper for ES6's fetch method (similar to [request][request]!)
* [koa-convert][koa-convert] - easily convert generator middleware functions to Async/Await
* [lodash][lodash] - the utility library
* [moment][moment] - date and time formatting and manipulation
* [underscore.string][underscore-string] - string manipulation
* [validator][validator] - string validation and sanitization


## [![glazed-logo-xs]](#-index) [Why should I use it?](#-why-should-i-use-it)

### Best Practices

* Zero-downtime, graceful reloading with automated continuous integration (see [deployment](#deployment)
* Automated test runner and code coverage setup using:
  - [chai][chai]
  - [check-chai][check-chai]
  - [dirty-chai][dirty-chai]
  - [isparta][isparta]
  - [istanbul][istanbul]
  - [jsdom][jsdom]
  - [mocha][mocha]
* Simple message alert system with [koa-connect-flash][koa-connect-flash] and Sweetalert
* API token without a password for an extremely simple approach to session-less, BasicAuth access
* [Stripe-inspired][stripe-inspired] API design with versioning, error handling, type description, and verbose list output with count and number of pages
* [No callback hell][callback-hell] since you can use Async/Await syntax

### Latest Standards

* Latest version of Node, `v6.0.0`
* Streams for build process with Gulp
* Newest version of MongoDB and Redis (e.g. you can use [$lookup][lookup-operator] operator with MongoDB now!)
* ES6/ES7 with Async/Await syntax
* Latest version of Koa, `v2.x` (or commonly referred to as `@next`)

### LiveReload Built-in

Through [koa-livereload][koa-livereload] and [gulp-livereload][gulp-livereload] your assets automatically reload as you continually change and save them.

This means you can have your editor open and a browser tab opened to your app at <http://localhost:3000/> &ndash; of course you need to be running the app with `gulp watch` &ndash; and your changes appear in real-time!  Yes, we know this is not new technology, but not many other frameworks had this built-in (at least the right way with gulp).

For example, if you make the following change to your stylesheet file and save it...

```diff
body {
-  background-color: red;
+  background-color: hotpink;
}
```

... then your background color on the browser tab will instantly change to hot pink.

### Production Ready

Glazed comes with a robust and well-tested Gulpfile (written with Babel!).  Check [it out here][gulpfile].

What's a Gulpfile?  You can [read about Gulp here][gulp] &ndash; but it's basically a file that has a series of build tasks defined (e.g. it's very similar to a `Makefile`).

In a production environment, your app's assets will be minified, compressed, gzipped,
revision hashed, and uploaded to Amazon S3 and CloudFront for load balancing.  To do this, we use
the packages [koa-manifest-rev][koa-manifest-rev] and [gulp-rev][gulp-rev], with plugins that include:

* [babelify][babelify] - convert ES6/ES7 code to ES5
* [browserify][browserify] - you can `import` (or `require`) modules in the browser!  You no longer need to use Bower.  We looked at using Webpack when we had worked on React Native stuff, but it was too complicated and we ran into way too many problems.
* [eslint][eslint] - lints your JavaScript according to the `.eslintrc` configuration.  Feel free to swap out our `.eslintrc` for something like [eslint-config-airbnb][eslint-config-airbnb].
* [gulp-awspublish][gulp-awspublish] - publishes to AWS your assets
* [gulp-cloudfront][gulp-cloudfront] - publishes to CloudFront your assets
* [gulp-eslint][gulp-eslint] - lints your JavaScript in the build runner
* [gulp-imagemin][gulp-imagemin] - compresses your images
* [gulp-postcss][gulp-postcss] - processes your CSS
* [gulp-sourcemaps][gulp-sourcemaps] - adds sourcemaps to your code for easy debugging
* [gulp-uglify][gulp-uglify] - uglifies and minifies your JavaScript code
* [imagemin-pngquant][imagemin-pngquant] - plugin for imagemin to compress PNG's

This is the de-facto standard for hosting images, fonts, scripts, and assets in general
&ndash; and it is managed properly in Glazed using asset revisioning.  For example, your file
named `glazed-logo.png` will become `glazed-logo-0775041dd4.png` in production (you don't have to worry about cache busting!).

Not only that, but your files will be linted and they come with sourcemaps too!

To build and publish to AWS for production, follow these simple steps:

```bash
NODE_ENV=production gulp build
NODE_ENV=production gulp publish
```

### Cross-browser Compatibility

<img width="100" height="100" style="width:100px;height:100px;" alt="Chrome" src="https://rawgit.com/alrra/browser-logos/master/chrome/chrome.svg" />
<img width="100" height="100" style="width:100px;height:100px;" alt="Android" src="https://rawgit.com/alrra/browser-logos/master/firefox/firefox.svg" />
<img width="100" height="100" style="width:100px;height:100px;" alt="Safari" src="https://raw.githubusercontent.com/alrra/browser-logos/master/safari/safari.png" />
<img width="100" height="100" style="width:100px;height:100px;" alt="Internet Explorer" src="https://rawgit.com/alrra/browser-logos/master/internet-explorer-tile/internet-explorer-tile.svg" />
<img width="100" height="100" style="width:100px;height:100px;" alt="Opera" src="https://raw.githubusercontent.com/alrra/browser-logos/master/opera/opera.png" />
<img width="100" height="100" style="width:100px;height:100px;" alt="Android" src="https://raw.githubusercontent.com/alrra/browser-logos/master/android/android.png" />

Is this cross-browser compatible?  Yes, 100%!  What about all of your ES6/ES7 code?  Yes, 100%.

**However, if you stick with the default v4 Bootstrap CSS framework &ndash; it only supports IE9+ and iOS 7+.**

All of your code is converted to browser-friendly ES5 vanilla JavaScript (using [Browserify][browserify] and [Babelify][babelify])...so it's cross-browser compatible!

> This means both your server-side and client-side code is built to the `./lib/` folder with ES5 syntax when the Gulpfile is run with `gulp build`.
You never have to worry about passing some `--harmony` flag either to run your app.
**The idea here is that you can focus on writing clean, short bits of code &ndash; and never have to worry about how it runs**.

### Built-in User Group Permissioning

By default, all users are assigned to the "user" group.  This group is defined in the user model under `app/models/user.js` per the property `'group'``.

This approach was inspired by classic Linux-based user-group permissioning.

We've also added a default policy helper to detect whether or not a user an admin, which you can add as a middleware before your controller logic.

For example, if you want to restrict access to all `/admin` routes, you can add this simple middleware:

```js
router.all('/admin*', policies.ensureAdmin);
```

**This simple middleware is automatically added by default for you.**

If you'd like to grant yourself admin access to the `/admin` routes, then you can run this script (replace with your email address and database name):

```bash
mongo glazed_development --eval 'printjson(db.users.update({ email: "niftylettuce@gmail.com" }, { $set: { group: "admin" }}));'
```


### Search Engine Indexing

Since we don't use a SPA, you don't have to worry about rendering SEO-friendly content!  What you see in the browser is what the search engine crawler sees ("WYSIWTSEC" or something... haha)!

By default, we provide a [simple to use configuration file][config-file-seo] that allows you to swap in page titles and descriptions for a majority of your routes.

For anything complex, you can customize them yourself by passing local variables `title` and `description` to views.

We didn't build in structured open graph tags as a default to edit, since we figure you can customize to your own.

**With this setup, we have climbed to #1 on Google for various keywords, easily.  Of course, you need great content and traffic!**

In order to prevent duplicate content, we have added a plugin that removes trailing slashes from URL's, so `/home/` will `301` redirect to `/home` automatically.

### l18n Localization

Yes, you can customize this for international localization.  But we didn't build this in by default.  We're just letting you know we thought of it.  If you want recommendations
on services to use for this and how to integrate, then [join our Slack][slack-url] and ask us!

### Performance

For performance, you should always use the `lean()` method while writing your Mongoose queries.

You should also **never use Mongoose hooks, virtuals, or the populate method**.

If you need to asynchronously populate or waterfall chain population of database references, we suggest to use the [$lookup operator][lookup-operator] or use Async/Await syntax to keep it clean.
For an example of how to write a `populate()` method with $lookup, [see this GitHub issue][gh-mongoose-issue].

We've also included these libraries to help with performance:

* [koa-compress][koa-compress] - compress responses with zlib
* [koa-conditional-get][koa-conditional-get] - allows conditional GET response (returns a `304` "Not Modified" header if condition matches)
* [koa-etag][koa-etag] - reduce bandwidth consumption with e-tags on responses
* [koa-response-time][koa-response-time] - adds a new response header called `X-Response-Time` with the number of milliseconds the server took to respond

Other than that, you just need to increase your server storage/bandwidth/memory/swap, add load balancing, and/or use PM2's clustering mode &ndash; and you _should_ be able to support thousands of users.  Horizontal scaling!

Check out the [deployment](#deployment) section below for how a production environment and deployment process should be configured.


## [![glazed-logo-xs]](#-index) [How do I use it?](#how-do-i-use-it)

### Requirements

**<u>You'll need to have the following installed</u>** on your operating system (we provide instructions below):

* [Node][node] `>= v6.x` (we recommend using [NVM][nvm] to manage your Node versions)
* [MongoDB][mongodb] `>= v3.x`
* [Redis][redis] `>= v3.x`

We also recommend that you install **our preferred [tools](#tools)** as well!

### Mac OS X

1. Install [Brew][brew]:

  ```bash
  /usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
  ```

2. Install [NVM][nvm]:

  ```bash
  curl -o- https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash
  source ~/.bashrc
  ```

3. Install [Node][node] with NVM:

  ```bash
  nvm install v6.0.0
  nvm alias default v6.0.0
  ```

4. Install [MongoDB][mongodb] (and make sure you read the line about `launchctl` after you hit `ENTER`):

  ```bash
  brew install mongo
  ```

5. Install [Redis][redis] (and make sure you read the line about `launchctl` after you hit `ENTER`):

  ```bash
  brew install redis
  ```

### Ubuntu

1. Install [NVM][nvm]:

  ```bash
  curl -o- https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash
  source ~/.bashrc
  ```

2. Install [Node][node] with NVM:

  ```bash
  nvm install v6.0.0
  nvm alias default v6.0.0
  ```

3. Install [MongoDB][mongodb]:

  ```bash
  sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
  echo "deb http://repo.mongodb.org/apt/ubuntu "$(lsb_release -sc)"/mongodb-org/3.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.0.list
  sudo apt-get update
  sudo apt-get install -y mongodb-org
  service mongod status
  ```

4. Install [Redis][redis]:

  ```bash
  sudo add-apt-repository ppa:chris-lea/redis-server
  sudo apt-get update
  sudo apt-get install redis-server
  redis-benchmark -q -n 1000 -c 10 -P 5
  source ~/.profile
  ```

### Windows

We do not support Windows, so please use [VirtualBox][virtualbox] or [Vagrant][vagrant] instead with [Ubuntu][ubuntu] or [Linux Mint][linux-mint].

### Installation

**It's simple; there is no CLI, and you don't need to install anything with NPM.  You just use git!**

You have two choices for installation:

1. You can fork this repository by clicking the "fork" icon at the <a href="#fork-destination-box">top of this page</a> (then you will need to `git clone` your fork locally).
2. Or you can mirror this repository by following [GitHub's instructions here][mirror-it].  If you mirror this repository, it won't appear on your GitHub as a "forked" repository (but you can still get updates).

### Configuration

#### How does configuration work?

We make configuration easy through a file called `.env` file using [dotenv][dotenv].

However, you'll need to modify it slightly for your own.  Let's dive into how it works!

Configuration is managed by the following:

* Contents of the file at `src/config/index.js` (reads in `process.env.SOME_VAR`)
* Contents of the files in directories under `src/config/environments/` (sets defaults per environment, e.g. you can pass `NODE_ENV=staging` and it will load the file at `/src/config/environments/staging.js`)
* Environment variables used to override defaults or set required ones
* Third-party OAuth providers (e.g. Google OAuth at <https://console.developers.google.com>)

Precedence is taken by the environment configuration files, environment variables, then the `.env` file.

Basically [dotenv][dotenv] won't set an environment variable if it already detects it was passed as an environment variable.

Take a look in the [src/config][src-config] folder contents and also at the default [.env.example][dot-env-file] file.

We've provided a default file called `.env.example`, **which you will need to rename** to `.env` and customize yourself.

#### How do I configure my app to boot?

**In order to set-up defaults needed for Glazed app to boot, please follow these instructions:**

1. Rename the file `.env.example` to `.env`
2. Go to <https://console.developers.google.com> &ndash; Create a project (and fill out your project information &ndash; if you need a 120x120px default image, [you can use this one][120x120])
3. Under your newly created project, go to Credentials &ndash; Create credentials &ndash; OAuth client ID &ndash; Web application
4. Set "Authorized JavaScript origins" to `http://yourdomain.com` (replace with your domain) and also `http://localhost:3000` (for local development)
5. Set "Authorized redirect URIs" to `http://yourdomain.com/login/ok` (again, replace with your domain) and also `http://localhost:3000/login/ok` (again, for local development)
6. Copy and paste the newly created key pair for respective properties in your `.env` file (example below)

  ```diff
  -GOOGLE_CLIENT_ID=
  +GOOGLE_CLIENT_ID=424623312719-73vn8vb4tmh8nht96q7vdbn3mc9pd63a.apps.googleusercontent.com
  -GOOGLE_CLIENT_SECRET=
  +GOOGLE_CLIENT_SECRET=Oys6WrHleTOksqXTbEY_yi07
  ```

7. Go to <https://console.aws.amazon.com/iam/home#security_credential> &dash; Access Keys &ndash; Create New Access Key
8. Copy and paste the newly created key pair for respective properties in your `.env` file (example below)

  ```diff
  -AWS_IAM_KEY=
  +AWS_IAM_KEY=AKIAJMH22P6W674YFC7Q
  -AWS_IAM_SECRET=
  +AWS_IAM_SECRET=9MpR1FOXwPEtPlrlU5WbHjnz2KDcKWSUcB+C5CpS
  ```

9. Go to <https://console.aws.amazon.com/s3/home> &ndash; Create Bucket
10. Create a bucket and copy/paste its name for the property in `.env` (example below)

  ```diff
  -AWS_S3_BUCKET=
  +AWS_S3_BUCKET=glazed-development
  ```

11. Go to <https://console.aws.amazon.com/cloudfront/home> &ndash; Create Distribution &ndash; Get Started
12. Set "Origin Domain Name" equal to your S3 bucket name (their autocomplete drop-down will help you find it)
13. Leave the remaining defaults as is (some fields might be blank, this is OK)
14. Copy/paste the newly created Distribution ID and Domain Name for respective properties in your `.env` file (example below)

  ```diff
  -AWS_CF_DI=
  +AWS_CF_DI=E2IBEULE9QOPVE
  -AWS_CF_DOMAIN=
  +AWS_CF_DOMAIN=d36aditw73gdrz.cloudfront.net
  ```

15. You can customize the favicon and touch icons &ndash; just generate a new set at <https://realfavicongenerator.net> and overwrite the existing in the [src/assets/][src-assets] folder.  Just make sure that the paths match up in the `src/assets/browserconfig.xml` and `src/assets/manifest.json` files.

That's it!

### Development

You should have Glazed [installed](#installation) and [configured](#configuration) by now.

1. Change directories to where you installed Glazed:

  ```bash
  cd /path/to/glazed/
  ```

2. Install NPM dependencies:

  ```bash
  npm install
  ```

3. Run the watch script:

  ```bash
  npm run watch
  ```

> The watch script will automatically open a browser tab for you (with [LiveReload](#livereload-built-in) enabled!).

### Deployment

<img alt="Automated Continuous Integration Deployment Setup" width="647" height="58" style="width:647px;height:58px;" src="https://d2jyi1ndcvo0nf.cloudfront.net/glazed-deploy.png" />

We've written a comprehensive tutorial for deployment, continuous integration, and how to automate everything &ndash; you can [read the article here][nifty-ci-setup].

If you're just interested in what tools/services we recommend, then here is a brief list:

* [GitHub][github] - repository hosting
* [Digital Ocean][do-referral]<sup>2</sup> - server hosting
* [SemaphoreCI][semaphoreci] - automated continuous integration
* [Route53][aws] - DNS management
* [Namecheap][namecheap] - domain name registrar
* [PM2][pm2]<sup>1,3</sup> - zero-downtime deployment
* [Sentry][sentry]<sup>1</sup> - log storage and query service
* [S3][aws]<sup>1</sup> - asset storage
* [CloudFront][aws]<sup>1</sup> - content delivery network for assets
* [Postmark][postmarkapp]<sup>1,4</sup> - transactional email
* [MailChimp][mailchimp] - bulk email
* [Slack][slack-referral-url]<sup>5</sup> - chat room &amp; automated notifications

<small><sup>1</sup> Baked into Glazed by default &ndash; you just need to provide credentials in the [configuration](#configuration) step</small><br />
<small><sup>2</sup> You can get $10 free credit for signing up by clicking our referral link above</small><br />
<small><sup>3</sup> We include `SIGTERM` listener for graceful reloading, see [src/index.js][src-index] for more insight</small><br />
<small><sup>4</sup> You can send 150,000 free ~~credits~~ transactional emails if you're [bootstrapped][bootstrapped-promotion] and [DMARC compliant][dmarc-promotion]</small><br />
<small><sup>5</sup> You can get $100 free credit for signing up by clicking our referral link above</small>

### Advice

The only way to ship code faster is to respect these three points:

1. Use as many [tools](#tools) as possible to automate your workflow.
2. Understand that [good coders code, and great reuse][good-coders-code].
3. Avoid anti-patterns and context-switching habits &ndash; you will easily stay focused!

### Tools

Here is a brief list of recommended tools used to ship rapidly developed MVP's:

* Use and modify the included `.github` folder of GitHub contribution templates (e.g. [./github/PULL_REQUEST_TEMPLATE.md][pr-template] is a pull request template).
* Use a Mac OS X (preferred), [Ubuntu][ubuntu], or [Linux Mint][linux-mint] operating system for development.  If you're on Windows, use [VirtualBox][virtualbox] to install [Ubuntu][ubuntu] or [Linux Mint][linux-mint], or you can setup a dual-boot with them.  Or you could use [Vagrant][vagrant].
* Use [brew][brew] to install other tools for planning and building your app (e.g. [GIMP][gimp], [Dropbox][dropbox], [Evernote][evernote], [iTerm 2 Beta][iterm], `google-chrome`, [git-extras][git-extras], [redis][redis], [mongodb][mongodb], `vim`, `wget`, ...).
* Use [Seuss.md][seuss] to plan out your thoughts in a Markdown document before writing any code (this is the "Readme First Approach" that [@tj][tj-github] and [@substack][substack-github] shared with me).
* Use [Sketch][sketch] to design your app's screens and basic mockups.
* Use `vim` as your editor to write your code &ndash; build up muscle memory by installing magnitude of plugins, which will automate [your puny human][puny-human] mistakes.  If you need inspiration, here is [@niftylettuce's vim config][vim-config].
* Install an `eslint` plugin into your text editor so that on file save it lints your code according to the rules defined in the [.eslintrc][eslint-file] file.
* Use [LookerUpper][lookerupper] plugin to easily lookup package documentation.
* Use [fixpack][fixpack] to keep your `package.json` file tidy by running `fixpack` after you alter it.
* Instead of using `npm install --save <name>` to install packages, use [pnpm][pnpm] to install them faster; `pnpm install --save <name>`.


## [![glazed-logo-xs]](#-index) [Is there a book on Glazed?](#-is-there-a-book-on-glazed)

**Yes, there is a book (coming soon) called <u>Rapid MVP's</u>**.  It comes with Markdown, HTML, and PDF versions, and also accompanying **<u>source code</u> AND <u>screencasts</u>**!  The author [@niftylettuce][nifty-twitter] is self-publishing, and goes in-depth to show you how to build rapid MVP's.  The book will include a "How It's Made" for at least two of his new (and hopefully profitable) side-projects.

It is **available for <u>early bird</u> pre-order** right now at <https://rapidmvp.com>!  Even if you don't buy the book, you can still get free/inspirational behind the scenes tips, tutorials, and videos!  And a sticker!

> **Get a <u>FREE GLAZED STICKER</u> mailed to you: <https://rapidmvp.com>** (no pre-order required)

## [![glazed-logo-xs]](#-index) [Can I get help?](#-can-i-get-help)

<a href="http://slack.glazed.io"><img alt="Join us in Slack" src="https://d2jyi1ndcvo0nf.cloudfront.net/glazed-slack-image.png" width="310" height="264.5" style="width:310px; height:264.5px;" /></a>

[Join us in Slack][slack-url].  Still need help?  [File an issue](/issues).


## [![glazed-logo-xs]](#-index) [How do I get updates?](#-how-do-i-get-updates)

We provide updates to this repository and a detailed changelog, which you can then add/merge into your project.  You will need to "star" and "watch" this repository to stay active.  We don't have an automated update system or a Google Group (and do not plan to).  It is your duty as a Rapid MVP developer to stay updated.  **<u>Lastly, it's a necessity</u>** that you [join us on Slack][slack-url] to stay in the loop!

You can also follow us on Twitter here:

* <https://twitter.com/glazedio>
* <https://twitter.com/niftylettuce>


## [![glazed-logo-xs]](#-index) [Who built it?](#-who-built-it)

Glazed `v1.0.0` was released in May 2016 by [@niftylettuce][nifty-twitter].

It is a modernized derivative of his project "Eskimo" (a derivative of "Expressling").


## [![glazed-logo-xs]](#-index) [Can we hire @glazed?](#-can-we-hire-glazed)

Of course!  Please email Niftylettuce LLC at <niftylettuce@gmail.com> to get in touch with a developer team fit for your project.
Even if we can't find someone for you, we'd love to help put you in the right direction.  We recommend to [join us in Slack][slack-url] first!

## [![glazed-logo-xs]](#-index) [License](#-license)

* Glazed is [MIT][license-url] licensed
* Doughnut by Andrey Vasiliev from the [Noun Project][noun-project]
* Glazed clay palette by Dia from [COLOURlovers][colour-lovers]


[gh-mongoose-issue]: https://github.com/Automattic/mongoose/issues/3683#issue-122632405
[mongoose-json-select]: https://github.com/nkzawa/mongoose-json-select
[mongoose-beautiful-unique-validation]: https://github.com/matteodelabre/mongoose-beautiful-unique-validation
[koa-nunjucks-promise]: https://github.com/hanai/koa-nunjucks-promise
[koa-ratelimit]: https://github.com/koajs/ratelimit
[koa-conditional-get]: https://github.com/koajs/conditional-get
[koa-etag]: https://github.com/koajs/etag
[koa-response-time]: https://github.com/koajs/response-time
[koa-connect-flash]: https://github.com/theverything/koa-connect-flash
[istanbul]: https://github.com/gotwarlost/istanbul
[jsdom]: https://github.com/tmpvar/jsdom
[mocha]: https://github.com/mochajs/mocha
[isparta]: https://github.com/douglasduteil/isparta
[dirty-chai]: https://github.com/prodatakey/dirty-chai
[check-chai]: https://github.com/niftylettuce/check-chai
[chai]: https://github.com/chaijs/chai
[koa-livereload]: https://github.com/yosuke-furukawa/koa-livereload
[gulp-livereload]: https://github.com/vohof/gulp-livereload
[request]: https://github.com/request/request
[boom]: https://github.com/hapijs/boom
[chalk]: https://github.com/chalk/chalk
[chalkline]: https://github.com/niftylettuce/chalkline
[dotenv]: https://github.com/motdotla/dotenv
[frisbee]: https://github.com/niftylettuce/frisbee
[koa-convert]: https://github.com/koajs/convert
[lodash]: https://github.com/lodash/lodash
[moment]: https://github.com/moment/moment
[underscore-string]: https://github.com/epeli/underscore.string
[validator]: https://github.com/chriso/validator.js
[koa-manifest-rev]: https://github.com/niftylettuce/koa-manifest-rev
[gulp-rev]: https://github.com/sindresorhus/gulp-rev
[babelify]: https://github.com/babel/babelify
[browserify]: https://github.com/substack/node-browserify
[eslint]: https://github.com/eslint/eslint
[gulp-awspublish]: https://github.com/pgherveou/gulp-awspublish
[gulp-cloudfront]: https://github.com/smysnk/gulp-cloudfront
[gulp-eslint]: https://github.com/adametry/gulp-eslint
[gulp-imagemin]: https://github.com/sindresorhus/gulp-imagemin
[gulp-postcss]: https://github.com/postcss/gulp-postcss
[gulp-sourcemaps]: https://github.com/floridoo/gulp-sourcemaps
[gulp-uglify]: https://github.com/terinjokes/gulp-uglify
[imagemin-pngquant]: https://github.com/imagemin/imagemin-pngquant
[noun-project]: https://thenounproject.com/term/doughnut/163279/
[colour-lovers]: http://www.colourlovers.com/palette/63788/Glazed_clay
[license-image]: http://img.shields.io/badge/license-MIT-blue.svg?style=flat
[license-url]: LICENSE
[mvc]: https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller
[nodejs]: https://nodejs.org
[node]: https://nodejs.org
[rapid-mvp]: https://github.com/niftylettuce/rapid-mvp-standards
[frameworks-dont-make-sense]: http://www.catonmat.net/blog/frameworks-dont-make-sense/
[async-await]: https://tc39.github.io/ecmascript-asyncawait/
[pkrumins]: https://twitter.com/paulg
[nifty-twitter]: https://twitter.com/niftylettuce
[pg-twitter]: https://twitter.com/pkrumins
[dont-scale]: http://paulgraham.com/ds.html
[npm]: https://www.npmjs.com/
[lookerupper]: https://github.com/niftylettuce/lookerupper
[puny-human]: http://fakegrimlock.com/
[vim-config]: https://github.com/niftylettuce/.vim
[eslint-file]: .eslintrc
[fixpack]: https://github.com/henrikjoreteg/fixpack
[good-coders-code]: http://www.catonmat.net/
[seuss]: https://github.com/niftylettuce/seuss.md
[tj-github]: https://github.com/t
[substack-github]: https://github.com/substack
[eskimo-ship]: http://niftylettuce.com/posts/eskimo-rapid-mvp-node-boilerplate/
[react]: https://github.com/facebook/react
[angular]: https://github.com/angular/angular
[nunjucks]: https://mozilla.github.io/nunjucks/
[standard-signature]: https://standardsignature.com/
[prove]: https://getprove.com
[wakeup]: https://wakeup.io
[niftylettuce-website]: http://niftylettuce.com
[pnpm]: https://github.com/rstacruz/pnpm
[gimp]: https://www.gimp.org/
[dropbox]: https://db.tt/2ZTl6efc
[evernote]: https://www.evernote.com/referral/Registration.action?sig=2e640ea469c7e68be162fb13114e2dca&uid=80317596
[iterm]: https://www.iterm2.com/
[git-extras]: https://github.com/tj/git-extras
[redis]: http://redis.io/
[mongodb]: https://www.mongodb.org/
[brew]: http://brew.sh/
[sketch]: https://www.sketchapp.com/
[koa]: https://github.com/koajs/koa/tree/v2.x
[glazed-logo]: https://d2jyi1ndcvo0nf.cloudfront.net/glazed-logo.svg
[glazed-logo-xs]: https://d2jyi1ndcvo0nf.cloudfront.net/glazed-logo-xs.svg
[glazed-description]: https://d2jyi1ndcvo0nf.cloudfront.net/glazed-description.svg
[glazed-url]: http://glazed.io
[slack-image]: http://slack.glazed.io/badge.svg
[slack-url]: http://slack.glazed.io
[mongoose]: http://mongoosejs.com/
[passport]: https://github.com/jaredhanson/passport
[passport-google-oauth]: https://github.com/jaredhanson/passport-google-oauth
[passport-package]: https://www.npmjs.com/search?q=passport
[pg]: https://github.com/brianc/node-postgres
[bookshelf]: https://github.com/tgriesser/bookshelf
[spa-image]: https://d2jyi1ndcvo0nf.cloudfront.net/spa-image.svg
[avc-chicken-image]: https://d2jyi1ndcvo0nf.cloudfront.net/avc-eat-this-chicken.jpg
[fake-grimlock]: http://avc.com/2011/09/minimum-viable-personality/
[browserify]: http://browserify.org
[babelify]: https://github.com/babel/babelify
[gulpfile]: gulpfile.babel.js
[gulp]: http://gulpjs.com/
[sweetalert]: https://t4t5.github.io/sweetalert/
[glazed-dependencies]: https://d2jyi1ndcvo0nf.cloudfront.net/glazed-dependencies.svg
[callback-hell]: http://callbackhell.com/
[bootstrap-4-alpha]: http://v4-alpha.getbootstrap.com/
[koa-compress]: https://github.com/omsmith/compress/tree/koa2
[lookup-operator]: https://docs.mongodb.org/manual/reference/operator/aggregation/lookup/
[koa-helmet]: https://github.com/venables/koa-helmet
[dns-prefetch]: https://github.com/helmetjs/dns-prefetch-control
[frameguard]: https://github.com/helmetjs/frameguard
[poweredby]: https://github.com/helmetjs/hide-powered-by
[hsts]: https://github.com/helmetjs/hsts
[ienoopen]: https://github.com/helmetjs/ienoopen
[nosniff]: https://github.com/helmetjs/dont-sniff-mimetype
[xssfilter]: https://github.com/helmetjs/x-xss-protection
[koa-vs-express]: https://github.com/koajs/koadocs/koa-vs-express.md
[express]: http://expressjs.com/
[stripe-inspired]: https://www.heavybit.com/library/video/move-fast-dont-break-api/
[eslint-config-airbnb]: https://github.com/airbnb/javascript/tree/master/packages/eslint-config-airbnb
[config-file-seo]: src/config/index.js
[src-index]: src/index.js
[mirror-it]: https://help.github.com/articles/duplicating-a-repository/
[nifty-ci-setup]: http://niftylettuce.com/posts/automated-node-app-ci-graceful-zerodowntime-github-pm2/
[slack-referral-url]: https://slack.com/r/02kjqk4v-06846hdf
[mailchimp]: http://mailchimp.com/
[postmarkapp]: https://postmarkapp.com
[aws]: https://console.aws.amazon.com
[sentry]: https://getsentry.com
[pm2]: https://github.com/Unitech/pm2
[namecheap]: https://www.namecheap.com/?aff=34556
[do-referral]: https://m.do.co/c/a7fe489d1b27
[github]: https://github.com/
[semaphoreci]: https://semaphoreci.com/
[dmarc-promotion]: https://postmarkapp.com/blog/get-100000-free-postmark-credits
[bootstrapped-promotion]: https://twitter.com/postmarkapp/status/197121068052389888
[src-config]: src/
[dot-env-file]: .env.example
[nvm]: https://github.com/creationix/nvm
[vagrant]: https://www.vagrantup.com/
[virtualbox]: https://www.virtualbox.org/wiki/Downloads
[linux-mint]: https://www.linuxmint.com/
[ubuntu]: http://www.ubuntu.com
[pr-template]: .github/PULL_REQUEST_TEMPLATE.md
[120x120]: https://d2jyi1ndcvo0nf.cloudfront.net/glazed-120x120.png
[build-image]: https://semaphoreci.com/api/v1/niftylettuce/glazed/branches/master/shields_badge.svg
[build-url]: https://semaphoreci.com/niftylettuce/glazed
[agenda]: https://github.com/rschmukler/agenda
[codecov-image]: https://img.shields.io/codecov/c/github/glazedio/glazed/master.svg
[codecov-url]: https://codecov.io/github/glazedio/glazed
[standard-image]: https://img.shields.io/badge/code%20style-standard%2Bes7-brightgreen.svg
[standard-url]: https://github.com/meetearnest/eslint-config-earnest-es7
[stability-image]: https://img.shields.io/badge/stability-stable-green.svg
[stability-url]: https://nodejs.org/api/documentation.html#documentation_stability_index
[src-assets]: src/assets/
