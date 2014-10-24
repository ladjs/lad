
// # user

var util = require('util');

var _ = require('underscore');
var _str = require('underscore.string');
_.mixin(_str.exports());

var jsonSelect = require('mongoose-json-select');
var strength = require('strength');
var passportLocalMongoose = require('passport-local-mongoose');
var validator = require('validator');
var mongoosePaginate = require('mongoose-paginate');
var randomstring = require('randomstring-extended');

exports = module.exports = function(settings, mongoose, iglooMongoosePlugin, email, logger) {

  var nameType = {
    type: String,
    required: true,
    validate: [ function(val) { return !_.isBlank(val); }, '{path} was blank' ],
    trim: true
  };

  var User = new mongoose.Schema({
    email: {
      type: String,
      required: true,
      unique: true,
      validate: [ validator.isEmail, 'Email is not a valid address' ],
      trim: true
    },
    name: nameType,
    surname: nameType,
    reset_token: String,
    reset_at: Date,
    api_token: String,
    facebook_id: String,
    facebook_access_token: String,
    facebook_refresh_token: String,
    google_id: String,
    google_access_token: String,
    google_refresh_token: String
  });

  // pre save
  User.pre('save', function(next) {
    var user = this;
    // set an API token for the user
    if (!user.api_token) {
      user.api_token = randomstring.token(32);
    }
    next();
  });

  // virtuals

  User.virtual('object').get(function() {
    return 'user';
  });

  User.virtual('full_name').get(function() {
    var user = this;
    return util.format('%s %s', user.name, user.surname);
  });

  User.virtual('full_email').get(function() {
    var user = this;
    return util.format('%s %s <%s>', user.name, user.surname, user.email);
  });

  // methods
  User.methods.sendWelcomeEmail = function sendWelcomeEmail(callback) {

    var user = this;

    email('welcome', {
      user: user,
      url: settings.url
    }, {
      to: user.full_email,
      subject: util.format('Eskimo - Welcome %s!', user.name)
    }, function(err, responseStatus) {
      if (_.isFunction(callback)) {
        return callback(err, responseStatus);
      }
      if (err) {
        return logger.error(err);
      }
      logger.info('Sent welcome email to %s', user.email);
    });

  };

  // statics
  User.static('validatePassword', function(password, callback) {

    // password validation
    if (_.isBlank(password)) {
      return callback('Password was blank');
    }

    //
    // ensure password strength is at least X
    // (X is defined in settings.minPasswordStrength)
    //
    // if length is at least 8 then +0.5
    // if mixed case strength then +0.5
    // if has both letters/numbers then +0.5
    //
    // more scoring metrics at:
    // <https://github.com/ruffrey/strength/blob/master/index.js>
    //
    var howStrong = strength(password);
    if (howStrong < settings.password.minStrength) {
      return callback('Password was not strong enough, please try again');
    }

    return callback();

  });

  // plugins

  // <https://github.com/saintedlama/passport-local-mongoose>
  User.plugin(passportLocalMongoose, {
    usernameField: 'email',
    usernameLowerCase: true,
    limitAttempts: settings.password.limitAttempts
  });

  User.plugin(jsonSelect, '-salt -hash -reset_token -reset_at');

  User.plugin(mongoosePaginate);

  // keep last
  User.plugin(iglooMongoosePlugin);

  return mongoose.model('User', User);
};

exports['@singleton'] = true;
exports['@require'] = [ 'igloo/settings', 'igloo/mongo', 'igloo/mongoose-plugin', 'igloo/email', 'igloo/logger' ];
