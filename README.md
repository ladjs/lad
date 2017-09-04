<h1 align="center">
  <a href="https://ladjs.github.io/lad/"><img src="media/lad.png" alt="lad" /></a>
</h1>
<div align="center">
  <a href="http://slack.crocodilejs.com"><img src="http://slack.crocodilejs.com/badge.svg" alt="chat" /></a>
  <a href="https://semaphoreci.com/niftylettuce/lad"> <img src="https://semaphoreci.com/api/v1/niftylettuce/lad/branches/master/shields_badge.svg" alt="build status"></a>
  <a href="https://codecov.io/github/ladjs/lad"><img src="https://img.shields.io/codecov/c/github/ladjs/lad/master.svg" alt="code coverage" /></a>
  <a href="https://github.com/sindresorhus/xo"><img src="https://img.shields.io/badge/code_style-XO-5ed9c7.svg" alt="code style" /></a>
  <a href="https://github.com/prettier/prettier"><img src="https://img.shields.io/badge/styled_with-prettier-ff69b4.svg" alt="styled with prettier" /></a>
  <a href="https://github.com/lassjs/lass"><img src="https://img.shields.io/badge/made_with-lass-95CC28.svg" alt="made with lass" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/ladjs/lad.svg" alt="license" /></a>
</div>
<br />
<div align="center">
  Lad scaffolds a <a href="">Koa</a> webapp and API framework for <a href="https://nodejs.org">Node</a>
</div>
<div align="center">
  <sub>
    A lad that fell in love with a <a href="https://github.com/lassjs/lass"><strong>lass</strong></a>
    &bull; Built by <a href="https://github.com/niftylettuce">@niftylettuce</a>
    and <a href="#contributors">contributors</a>
  </sub>
</div>


## Table of Contents

* [Philosophy](#philosophy)
* [Features](#features)
  * [Microservices](#microservices)
  * [Frontend](#frontend)
  * [Backend](#backend)
  * [Performance](#performance)
  * [Security](#security)
* [Get Started](#get-started)
  * [Requirements](#requirements)
  * [Install](#install)
  * [Usage](#usage)
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

> Lad boasts dozens of features and is extremely configurable.

The following is a brief list of features; as you use Lad you will discover more.

### Microservices

* Webapp server (via `app.js`)
* API server (via `api.js`)
* Job server (via `agenda.js`)
* Proxy server (via `proxy.js`)

### Frontend

* Pug
* Bootstrap 4
* Font Awesome
* SpinKit
* SweetAlert2
* Dense
* Waypoints
* LiveReload
* Frisbee

### Backend

* Redis, sessions, and flash messaging
* Koa-based webapp and API servers
* RESTful API with BasicAuth and versioning
* Agenda-based job scheduler with cron and human-readable syntax
* Passport-based authentication and group-based permissioning
* Stripe-inspired error handling with Boom
* Mongoose and MongoDB with common database plugins
* Email template engine with Nodemailer and local rendering
* Proxy eliminates need for Nginx reverse-proxy or Apache virtual hosts
* Multilingual through i18n and i10n
* Automatic phrase translation with Google Translate
* Sitemap generator for simple SEO

### Performance

* Compression and zero-bloat approach
* Stream-based file uploading
* Graceful reloading, shutdown, and reconnection handling
* Manifest asset revisioning
* Amazon S3 and CloudFront ready

### Security

* Database security plugins and helpers
* Automated tests and code coverage
* CSRF, XSS, and rate limited protection
* Dotenv support for environment-based configurations
* App, user, and request-based logging
* SSL-ready


## Get Started

> We strictly support Mac and Ubuntu-based operating systems (Windows _might_ work).

### Requirements

Please ensure your operating system has the following software installed:

* [Git][] - see [GitHub's tutorial][github-git] for installation

* [Node.js][node] (v8.x+) - use [nvm][] to install it on any OS

  * After installing `nvm` you will need to run `nvm install node`
  * We also recommend you install [yarn][], which is an alternative to [npm][]

* [MongoDB][] (v3.x+):

  * Mac (via [brew][]): `brew install mongodb`
  * Ubuntu:

    ```sh
    sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 0C49F3730359A14518585931BC711F9BA15703C6
    echo "deb http://repo.mongodb.org/apt/ubuntu "$(lsb_release -sc)"/mongodb-org/3.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.4.list
    sudo apt-get update
    sudo apt-get -y install mongodb-org
    ```

* [Redis][] (v4.x+):

  * Mac (via [brew][]): `brew install redis-server`
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

```sh
lad new-project
cd new-project
```

### Tutorials

* [Writing Your App](https://github.com/koajs/koa#getting-started)
* [Continous Integration and Deployment](http://niftylettuce.com/posts/automated-node-app-ci-graceful-zerodowntime-github-pm2/)

### Community

* [Follow us on Twitter][twitter]
* [Join our Slack channel][slack]
* [Subscribe to our Twitch channel][twitch]
* [Visit Koa's Community section](https://github.com/koajs/koa#community).


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

[git]: https://git-scm.com/

[slack]: http://slack.crocodilejs.com/

[brew]: https://brew.sh/

[twitter]: https://twitter.com/niftylettuce

[twitch]: https://www.twitch.tv/niftylettuce
