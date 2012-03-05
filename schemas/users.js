
// # Users

var bcrypt = require('bcrypt')
  , troop  = require('mongoose-troop');

module.exports = function(db) {
  var Email = db.SchemaTypes.Email
    , Users = new db.Schema({
        email: {
          type: Email,
          unique: true,
          required: true,
          lowercase: true
        },
        hash: String,
        name: {
          first: {
            type: String,
            required: true
          },
          last: {
            type: String,
            required: true
          }
        },
        company: String,
        _group: {
          default: "user",
          required: true,
          type: String,
          ref: 'Groups'
        },
        random_string: String
      });

  Users.virtual('name.full').get(function() {
    return this.name.first + ' ' + this.name.last;
  });

  Users.plugin(troop.timestamp);
  Users.plugin(troop.basicAuth, {
    loginPath: 'email'
  });
  Users.static('access', exports.access(db));
  Users.static('groupCount', exports.groupCount);

  return db.model('Users', Users);
};

exports.groupCount = function(spec, cb) {
  this.count(spec, function(err, count) {
    if (err) console.log(err);
    var n = count;
    cb(err, n);
  });
};

exports.access = function(db) {
  return function(groupName) {
    return function(req, res, next) {
      if(req.loggedIn) {
        if(req.route.path === '/login') {
          if(req.session.redirectTo) {
            var redirectTo = req.session.redirectTo;
            delete req.session.redirectTo;
            res.redirect(redirectTo);
          } else {
            req.flash('notice', 'You are already logged in');
            res.redirect('/');
          }
        } else {
          if(typeof groupName === "undefined") {
            next();
          } else {
            var Users = db.model('Users');
            Users
              .findById(req.session.auth._id)
              .populate('_group')
              .run(function (err, user) {
                if(err) {
                  req.flash('error', err);
                  return res.redirect('/');
                }
                if(user) {
                  if(typeof user._group !== 'undefined' && typeof user._group._id !== 'undefined') {
                    if(groupName instanceof Array) {
                      var _ = require('underscore');
                      if(_.indexOf(groupName, user._group.id) !== -1) {
                        next();
                        return;
                      }
                    } else {
                      if((groupName === user._group.id) || (groupName === "super_admin")) {
                        next();
                        return;
                      }
                    }
                  }
                  req.flash('error', 'Your group does not have permissions for this request');
                  res.redirect('/');
                } else {
                  req.flash('error', 'Your account is not currently accessible');
                  res.redirect('/logout');
                }
              });
          }
        }
      } else {
        if(req.route.path === '/login') {
          next();
        } else {
          req.session.redirectTo = req.route.path;
          res.redirect('/login');
        }
      }
    };
  };
};
