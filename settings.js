
// # Settings

  // ## Express
var express = require('express')

  // ## HTML5 Boilerplate
  , h5bp = require('h5bp')

  // ## Common
  , colors = require('colors')
  , fs     = require('fs')
  , mime   = require('mime')
  , gzippo = require('gzippo')
  , path   = require('path')
  , walk   = require('walk')

  // ## Public Directory
  , publicDir = path.join(__dirname, 'public')

  // ## Good/Bad Logging
  //
  //  **TODO:** this should be added to Marak's `colors`
  //   (e.g. 'mystring'.bad -- which would prepend the red ✗)
  //
  //  Don't use error/success since that _could_ conflict with callbacks.
  //
  , good = "  ✔ ".green
  , bad  = "  ✗ ".red

  // ## Config
  //
  //  Based on your project's needs, you should configure `package.json`
  //   accordingly to the [npm](http://npmjs.org) packages used.
  //   <http://wiki.commonjs.org/wiki/Packages/1.0>
  //
  , config = require('./config')
  , env    = process.env.NODE_ENV || 'development'

  // ## Mongo Session Store
  , MongoStore = require('connect-mongo')

  // ## Stylus
  , stylus = require('stylus')

  // ## Nib
  , nib = require('nib')

  // ## Logs
  , logs = config[env].logs
  , css  = config[env].css

  // ## Stylus Configuration
  , stylusConfig = config[env].stylus;

// ## Express Logging
logs.string = ''
  + '\\n  ' + ':date'.bold.underline + '\\n\\n' + '  IP: '.cyan.bold
  + ' ' + ':remote-addr'.white + '\\n' + '  Method: '.red.bold
  + ':method'.white + '\\n' + '  URL: '.blue.bold + ':url'.white
  + '\\n' + '  Status: '.yellow.bold + ':status'.white + '\\n'
  + '  User Agent: '.magenta.bold + ':user-agent'.white;

// ## Stylus Logging
css.string = function() {
  return ''
    + '\n' + good + ' Stylus has detected changes and compiled new assets'
    + ' ' + this.count + ' times so far' + '\n';
};

// ## Stylus Compiler
// <https://github.com/LearnBoost/stylus/blob/master/lib/middleware.js#L25-75>
var compiler = function(str, path) {
  if (css.set) {
    css.count++;
    var cssString = css.string();
    console.log(cssString);
  }
  return stylus(str)
    .set('filename', path)
    .set('compress', stylusConfig.compress)
    .set('warn', stylusConfig.warn)
    .set('force', stylusConfig.force)
    .set('linenos', stylusConfig.linenos)
    .use(nib());
};

// ## Helper functions

// [Return existing connection info][1]
// [1]: <http://dailyjs.com/2010/12/06/node-tutorial-5/>
function mongoStoreConnectionArgs(db) {
  return {
      db: db.connections[0].db.databaseName
    , host: db.connections[0].db.serverConfig.host
    , port: db.connections[0].db.serverConfig.port
    , username: db.connections[0].user
    , password: db.connections[0].pass
  };
}

// Logout middleware helper
function logout(req, res, next) {
  req.logout = function() {
    delete req.session.auth;
  };
  next();
}

// Login middleware helper
function loggedIn(req, res, next) {
  if(req.session.auth) {
    req.loggedIn = true;
  } else {
    req.loggedIn = false;
  }
  next();
}

// Create a "super_admin" user and group if one does not already exist
function createSuperAdmin(db) {
  var Groups = db.model('Groups')
    , Users = db.model('Users');
  Groups.count(config[env].super_group, function(err, count) {
    if(err) console.log(err);
    if(count === 0) {
      Groups.create(config[env].super_group, function(err, group) {
        if(err) console.log(err);
        if(group) {
          Users.register(config[env].super_user, function(err, user) {
            if(err) console.log(bad + err);
            if(user) console.log(good + "'super_admin' user/group created");
          });
        }
      });
    }
  });
}

// Create a "user" user and group if one does not already exist
function createUser(app, db) {
  var Groups = db.model('Groups')
    , Users = db.model('Users');
  Groups.count(config[env].user_group, function(err, count) {
    if(err) console.log(err);
    if(count === 0) {
      Groups.create(config[env].user_group, function(err, group) {
        if(err) console.log(err);
        if(group) {
          Users.register(config[env].default_user, function(err, user) {
            if(err) console.log(bad + err);
            if(user) console.log(good + "'user' user/group created");
            return group;
          });
        }
      });
    }
  });
}

// ## Application Configuration
exports.bootApplication = function(app, db) {

  // ### Create Super Admin
  createSuperAdmin(db);

  // ### Create User Group
  createUser(app, db);

  // ### Default Settings
  app.configure(function() {
    app.set('root', __dirname);
    app.set('public', publicDir);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser());
    app.set('showStackError', config[env].show_stack_error);
    if (logs.set) app.use(express.logger(logs.string));
    // Load Mongo session store
    app.use(express.session({
        secret: config[env].secret
      , maxAge: config[env].cache_age
      , store: new MongoStore(mongoStoreConnectionArgs(db))
    }));
    // Check for csrf using Connect's csrf module
    app.use(express.csrf());
    // Favicon
    app.use(express.favicon(path.join(publicDir, 'favicon.ico')));
    // Extra Route Middleware
    app.use(logout);
    app.use(loggedIn);
    // Routing (keep this last)
    app.use(app.router);
  });

  // ### Development Settings
  //     For a quick start
  //     $ node server.js
  //     Or if you have installed nodemon via:
  //     $ npm install -g nodemon
  //     $ nodemon
  //     Then point your browser to <http://localhost:8080/>.
  app.configure('development', function() {
    app.use(stylus.middleware({
      src: __dirname + '/views',
      dest: publicDir,
      debug: css.debug,
      compile: compiler
    }));
    app.use(express.static(publicDir, { maxAge: config[env].cache_age }));
  });

  // ### Staging Settings
  // **TODO**: Build out the configuration for this mode.
  // `$ NODE_ENV=staging node server.js`
  // Then point your browser to <http://localhost:8081/>.

  // ### Production Settings
  // `$ NODE_ENV=production node server.js`
  // Then point your browser to <http://localhost/>.
  app.configure('production', function() {
    app.use(stylus.middleware({
      src: __dirname + '/views',
      dest: publicDir,
      debug: css.debug,
      compile: compiler
    }));
    // Enable gzip compression is for production mode only
    app.use(gzippo.staticGzip(publicDir, { maxAge: config[env].cache_age }));
    // Enable view caching
    app.enable('view cache');
  });

  // ### Dynamic View Helpers
  app.dynamicHelpers({
    env: function() {
      return app.set('env');
    },
    request: function(req) {
      return req;
    },
    base: function() {
      // Return the app's mount-point so that urls can adjust
      return '/' === app.route ? '' : app.route;
    },
    // [Flash messages](https://github.com/visionmedia/express-messages/)
    messages: require('express-messages'),
    // [Dateformat helper](https://github.com/loopj/commonjs-date-formatting/)
    dateformat: function(req, res) {
      return require('./lib/dateformat').strftime;
    },
    loggedIn: function(req) {
      if (req.session.auth) {
        return true;
      } else {
        return false;
      }
    },
    cacheBuster: require('express-cachebuster'),
    user: function (req, res) {
      return req.session.auth;
    },
    access: function (req, res) {
      return function(groupName) {
        if(this.loggedIn
          && typeof groupName !== "undefined"
          && typeof this.user !== "undefined"
          && typeof this.user._group !== "undefined") {
          if(groupName instanceof Array) {
            var _ = require('underscore');
            if(_.indexOf(groupName, this.user._group._id) !== -1) {
              return true;
            }
          } else if ((groupName === this.user._group._id) || (groupName === "super_admin")) {
            return true;
          }
        }
        return false;
      };
    },
    // Generate token using Connect's csrf module
    //  and in your Jade view use the following:
    //  `input(type="hidden",name="_csrf", value=csrf)`
    csrf: function(req, res) {
      return req.session._csrf;
    }
  });
  exports.bootExtras(app);
  exports.bootRoutes(app, db);
};

// ## Error Configuration
exports.bootErrorConfig = function(app) {
  // Since this is the last non-error-handling middleware use()d,
  //  we assume 404, as nothing else responded.
  app.use(function(req, res, next) {
    // The status option, or res.statusCode = 404 are equivalent,
    //  however with the option we get the "status" local available as well
    res.render('404', {
      layout: false,
      status: 404,
      title: 'Page not found :('
    });
  });

  //     Error-handling middleware, take the same form as regular middleware,
  //     however they require an arity of 4, aka the signature (err, req, res, next)
  //     when connect has an error, it will invoke ONLY error-handling middleware.
  //
  //     If we were to next() here any remaining non-error-handling middleware would
  //     then be executed, or if we next(err) to continue passing the error, only
  //     error-handling middleware would remain being executed, however here we
  //     simply respond with an error page.

  app.use(function(err, req, res, next) {
    // We may use properties of the error object here and next(err)
    // appropriately, or if we possibly recovered from the error, simply next().
    res.render('500', {
      layout: false,
      status: err.status || 500,
      error: err,
      showStack: app.settings.showStackError,
      title: 'Something went wrong, oops!'
    });
  });

};

// ## Load Schemas
exports.bootSchemas = function(app, db) {
  var dir    = path.join(__dirname, 'schemas')
    , walker = walk.walk(dir, { followLinks: false });
  walker.on('file', function(root, stat, next) {
    // Allows us to have JSON files with default schema data in same folder
    if(path.extname(stat.name) === '.js') {
      require(path.join(root, stat.name))(db);
    }
    next();
  });
  walker.on('end', function() {
    exports.bootApplication(app, db);
  });
};

// ## Load Routes
exports.bootRoutes = function(app, db) {
  var dir     = path.join(__dirname, 'routes')
    , walker  = walk.walk(dir, { followLinks: false });
  walker.on('file', function(root, stat, next) {
    require(path.join(root, stat.name))(app, db);
    next();
  });
  walker.on('end', function() {
    exports.bootErrorConfig(app);
  });
};

// ## Extras
exports.bootExtras = function(app) {
  app.use(h5bp.ieEdgeChromeFrameHeader());
  app.use(h5bp.protectDotfiles());
  app.use(h5bp.blockBackupFiles());
  app.use(h5bp.removePoweredBy());
  app.use(h5bp.crossDomainRules());
  app.use(h5bp.suppressWww(true));
  app.use(h5bp.removeEtag());
};
