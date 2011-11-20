# Upgrade notes for node 0.6+

**The current version of `expressling` in npm is for 0.4.x, not 0.6+**

`connect-mongo` and `gzippo` need to be manually copied over from `/tmp_npm` to
`/node_modules`.  Until the npm owners push 0.6+ compatible versions of their
packages, we have to manually remove them from `package.json` and install them.
The reason why `gzippo` is not working is because `compress` is not compatible
with 0.6+, and `compress` is a dependency of `gzippo`.  In `node` 0.6+ there is
a zlib api which the author of `gzippo` is planning to use.

See <https://github.com/tomgallacher/gzippo/issues/13/> for more info.

If you are using 0.6+ you will need to follow these instructions:

    git clone git://github.com/niftylettuce/expressling.git
    cd expressling && mkdir node_modules
    cp tmp_npm/connect-mongo node_modules/connect-mongo
    cd connect-mongo && npm install -d && cd ../
    cp tmp_npm/gzippo node_modules/gzippo
    cd node_modules/gzippo/compress && npm install -d
    node-waf configure && node-waf build
    cd ../ && npm install -d
    node server.js

If you follow these steps, then ignore the quick start for now until `gzippo`
and  `connect-mongo` get updated on npm by their owners.  Then we will publish
an updated version of `expressling` to npm and you can be 0.6+ happy!


# Expressling

Open source [node.js](http://nodejs.org) + [express](http://expressjs.com/) application framework.

Expressling currently includes:

- [HTML5 Boilerplate](http://h5bp.com/)
- [MongoDB](http://www.mongodb.org/)
- [Mongoose](http://mongoosejs.com/)
- [Jade](http://jade-lang.com/)
- [Stylus](http://learnboost.github.com/stylus/)

## Requirements

  * [node](https://github.com/joyent/node)
  * [npm](https://github.com/isaacs/npm)

## Quick start

      npm install -g expressling
      expressling project-name && cd project-name
      npm install -d
      node server.js

The default user's credentials are:

* **Email**: hello@expressling.com
* **Password**: expressling

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
