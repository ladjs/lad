
# Expressling

Expressling is now `node` v0.6.3+ compatible!

Thanks to @wavded (`connect-mongo`) and @tomgallacher (`gzippo`).

Open source [node.js](http://nodejs.org) + [express](http://expressjs.com/) application framework.

Chat with us in IRC on freenode #expressling.

Expressling currently includes:

- [HTML5 Boilerplate](http://h5bp.com/)
- [MongoDB](http://www.mongodb.org/)
- [Mongoose](http://mongoosejs.com/)
- [Jade](http://jade-lang.com/)
- [Stylus](http://learnboost.github.com/stylus/)

## Requirements

  * [node](https://github.com/joyent/node) **>= v0.6.3**
  * [npm](https://github.com/isaacs/npm)

## Stay updated

Before you run `expressling` from command-line, we suggest that you
`npm update expressling` to ensure you are using the latest stable version.

## <a href="#quick-start" name="quick-start">Quick start</a>

      npm install -g expressling
      expressling project-name && cd project-name
      npm install -d
      node server.js

The default super admins's credentials are:

* **Email**: admin@expressling.com
* **Password**: admin

The default user's credentials are:

* **Email**: user@expressling.com
* **Password**: user

If you encounter errors please tweet [@expressling][1] and post an [issue][2].
[1]: https://twitter.com/#!/niftylettuce
[2]: https://github.com/niftylettuce/expressling/issues/new

## About the project

Our goal is to provide an simple, interchangable boilerplate for the community.
(e.g. pick and choose [Stylus][3] vs. [LESS][4], [CoffeeScript][5] vs.
[JavaScript][6], [MongoDB][7] vs. [CouchDB][8], [Eco][9] vs. [Jade][10] ...).

[3]: http://learnboost.github.com/stylus
[4]: http://lesscss.org
[5]: http://jashkenas.github.com/coffee-script
[6]: https://developer.mozilla.org/en/JavaScript/Reference
[7]: http://www.mongodb.org
[8]: http://couchdb.apache.org
[9]: https://github.com/sstephenson/eco
[10]: http://jade-lang.com

The end-result is to have a robust [npm](http://npmjs.org) CLI that allows you to run
`$ expressling project-name [options]` (e.g. `$ expressling project-name -c stylus -t jade -d postgresql`)
to quickly deploy a new project based on your needs.

If you clone this repo to contribute, you need to `chmod +x ./bin/expressling`.

## Credits

* Maintainer: [@niftylettuce](https://twitter.com/#!/niftylettuce)
* Contributors:
    - Your name could go here (and in `package.json`)!
* Twitter: [@expressling](https://twitter.com/#!/expressling)
* Website: <http://expressling.com/>
* Source: <https://github.com/niftylettuce/expressling/>

Expressling was inspired by several [node.js](http://nodejs.org) projects.


## List of community TODO's

* Better implementation of password/salt authentication
 or **implement [mongoose-auth](https://github.com/bnoguchi/mongoose-auth)**
* Forever and Upstart documentation
* Support for CoffeeScript, SASS, Less, and other template/stylesheet engines
* Start a Wiki
    - How-to for deploying with nodejitsu
    - How-to for using MongoHQ in production deployments
* Integrate SSL support

# License

MIT Licensed
