# Upgrade notes for node 0.6+
### (ignore this section and jump to [quick-start](#quick-start) if you're not using node 0.6+)

**The current version of `expressling` in npm is for 0.4.x, not 0.6+**

Per this [pull request](https://github.com/kcbanner/connect-mongo/pull/18)
we are waiting on the author to push an updated package of `connect-mongo` to npm.

Special thanks to @tomgallacher for getting `gzippo` working with node's new compress module!

If you are using 0.6+ you will need to follow these instructions:

    git clone git://github.com/niftylettuce/expressling.git
    cd expressling
    cp -r tmp_node_modules/ node_modules/
    cd node_modules/connect-mongo && npm install -d
    cd ../ && npm install -d
    node server.js

If you follow these steps, then ignore the quick start until `connect-mongo`
gets updated on npm by their owners.  Then we will publish n updated version of
`expressling` to npm and we will all be 0.6+ ready!


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

## <a href="#quick-start" name="quick-start">Quick start</a>

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
