
/*!
 * connect-mongo
 * Copyright(c) 2011 Casey Banner <kcbanner@gmail.com>
 * MIT Licensed
 */

/**
 * Module dependencies
 */

var Store = require('connect').session.Store;
var mongo = require('mongodb');
var url = require('url');

/**
 * Default options
 */

var defaultOptions = {host: '127.0.0.1',
                      port: 27017,
                      collection: 'sessions',
                      auto_reconnect: false,
                      clear_interval: -1};

/**
 * Initialize MongoStore with the given `options`.
 * Calls `callback` when db connection is ready (mainly for testing purposes).
 *
 * @param {Object} options
 * @param {Function} callback
 * @api public
 */

var MongoStore = module.exports = function MongoStore(options, callback) {
  options = options || {};
  Store.call(this, options);

  if(options.url) {
    var db_url = url.parse(options.url);

    if (db_url.port) {
      options.port = db_url.port;
    }
    
    if (db_url.pathname != undefined) {
      var pathname = db_url.pathname.split('/');

      if (pathname.length >= 2) {
        options.db = pathname[1];
      }
      
      if (pathname.length >= 3) {
        options.collection = pathname[2];
      }
    }
    
    if (db_url.hostname != undefined) {
      options.host = db_url.hostname;
    }

    if (db_url.auth != undefined) {
      var auth = db_url.auth.split(':');

      if (auth.length >= 1) {
        options.username = auth[0];
      }
      
      if (auth.length >= 2) {
        options.password = auth[1];
      }
    }
  }
  
  if(!options.db) {
    throw new Error('Required MongoStore option `db` missing');
  }
  
  this.db = new mongo.Db(options.db,
                         new mongo.Server(options.host || defaultOptions.host,
                                          options.port || defaultOptions.port, 
                                          {
                                            auto_reconnect: options.auto_reconnect ||
                                              defaultOptions.auto_reconnect
                                          }));
  
  this.db_collection_name = options.collection || defaultOptions.collection;

  var self = this;
  this._get_collection = function(callback) {
    if (self.collection) {
      callback && callback(self.collection);
    } else {
      self.db.collection(self.db_collection_name, function(err, collection) {
        if (err) {
          throw new Error('Error getting collection: ' + self.db_collection_name);
        } else {
          self.collection = collection;
              
          var clear_interval = options.clear_interval || defaultOptions.clear_interval;
          if (clear_interval > 0) {
            self.clear_interval = setInterval(function() {          
              self.collection.remove({expires: {$lte: new Date()}});
            }, clear_interval * 1000, self);
          }
          
          callback && callback(self.collection);
        }      
      });    
    }
  };
  
  this.db.open(function(err, db) {
    if (err) {
      throw new Error('Error connecting to database');
    }

    if (options.username && options.password) {
      db.authenticate(options.username, options.password, function () {
        self._get_collection(callback);
      });
    } else {
      self._get_collection(callback);
    }
  });
};

/**
 * Inherit from `Store`.
 */

MongoStore.prototype.__proto__ = Store.prototype;

/**
 * Attempt to fetch session by the given `sid`.
 *
 * @param {String} sid
 * @param {Function} fn
 * @api public
 */
MongoStore.prototype.get = function(sid, callback) {
  this._get_collection(function(collection) {    
    collection.findOne({_id: sid}, function(err, session) {
      try {
        if (err) {
          callback(err, null);
        } else {      
          
          if (session) {
            if (!session.expires || new Date < session.expires) {
              callback(null, JSON.parse(session.session));
            } else {
              self.destroy(sid, callback);
            }
          } else {
            callback();
          }
        }
      } catch (err) {
        callback(err);
      }
    });
  });
};

/**
 * Commit the given `sess` object associated with the given `sid`.
 *
 * @param {String} sid
 * @param {Session} sess
 * @param {Function} fn
 * @api public
 */

MongoStore.prototype.set = function(sid, session, callback) {
  try {
    var s = {_id: sid, session: JSON.stringify(session)};

    if (session && session.cookie && session.cookie._expires) {
      s.expires = new Date(session.cookie._expires);
    }

    this._get_collection(function(collection) {
      collection.update({_id: sid}, s, {upsert: true, safe: true}, function(err, data) {
        if (err) {
          callback && callback(err);
        } else {
          callback && callback(null);
        }
      });
    });
  } catch (err) {
    callback && callback(err);
  }
};

/**
 * Destroy the session associated with the given `sid`.
 *
 * @param {String} sid
 * @api public
 */

MongoStore.prototype.destroy = function(sid, callback) {
  this._get_collection(function(collection) {
    collection.remove({_id: sid}, function() {
      callback && callback();
    });
  });
};

/**
 * Fetch number of sessions.
 *
 * @param {Function} fn
 * @api public
 */

MongoStore.prototype.length = function(callback) {
  this._get_collection(function(collection) {
    collection.count({}, function(err, count) {
      if (err) {
        callback && callback(err);
      } else {
        callback && callback(null, count);
      }
    });
  });
};

/**
 * Clear all sessions.
 *
 * @param {Function} fn
 * @api public
 */

MongoStore.prototype.clear = function(callback) {
  this._get_collection(function(collection) {
    collection.drop(function() {
      callback && callback();
    });
  });
};
