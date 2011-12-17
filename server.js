
//     Expressling
//     Copyright (c) 2011 Nick Baugh (niftylettuce@gmail.com)
//     MIT Licensed

// Open source [node.js][1] + [express][2] application framework.
// [1]: http://nodejs.org/
// [2]: http://expressjs.com/

// * Maintainer: [@niftylettuce](https://twitter.com/#!/niftylettuce)
// * Twitter: [@expressling](https://twitter.com/#!/expressling)
// * Website: <http://expressling.com/>
// * Source: <https://github.com/niftylettuce/expressling/>

// This was inspired by several [node.js](http://nodejs.org) projects.

// # Expressling

    // ## Express
var express = require('express')
  , app     = express.createServer()

    // ## Common
  , fs  = require('fs')

    // ## Config
    // Based on your project's needs, you should configure `package.json`
    //  accordingly to the [npm](http://npmjs.org) packages used.
    //
    // * <http://wiki.commonjs.org/wiki/Packages/1.0>
    //
  , config = require('./config')

    // ## Settings
  , settings = require('./settings')

    // ## Environment
  , env  = process.env.NODE_ENV || 'development'
  , port = process.env.PORT || config[env].port

    // ## Mongoose
  , mongoose      = require('mongoose')
  , mongooseTypes = require("mongoose-types")

    // ## Database
    // You might want to use [MongoHQ](http://mongohq.com/) for production
    //  or try another provider if MongoHQ doesn't satisfy your needs.
    //
    // * <http://www.mongodb.org/display/DOCS/Connections/>
    // * <http://www.mongodb.org/display/DOCS/A+Sample+Configuration+Session/>
    //
    // Use either a `mongodb://` URI or pass `host, database, port, options`.
  , db = mongoose.connect(
    config[env].db.host,
    config[env].db.database,
    config[env].db.port
  );

// # Load mongooseTypes
//  You may want to allow all types (e.g. both email and url)
mongooseTypes.loadTypes(mongoose, 'email');

// # Load settings
settings.bootApplication(app, db);
settings.bootRoutes(app, db);
settings.bootErrorConfig(app);

// # Start server
app.listen(port);
var appPort = app.address().port + '', // stringify that int!
    appEnv = app.settings.env.toUpperCase();

// # Colorful status
console.log(''
  + '\n  EXPRESSLING SERVER LISTENING ON PORT '.rainbow
  + " ".white.inverse
  + appPort.white.inverse
  + " ".white.inverse
  + ' IN '.rainbow
  + " ".white.inverse
  + appEnv.white.inverse
  + " ".white.inverse
  + ' MODE '.rainbow
);
