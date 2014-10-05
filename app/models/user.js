
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

exports = module.exports = function(settings, mongoose, iglooMongoosePlugin) {

  var nameType = {
    type: String,
    required: true,
    validate: function(val) { return !_.isBlank(val); },
    trim: true
  };

  var User = new mongoose.Schema({
    email: {
      type: String,
      required: true,
      unique: true,
      validate: validator.isEmail,
      trim: true
    },
    name: nameType,
    surname: nameType,
    reset_token: String,
    reset_at: Date
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

  User.plugin(jsonSelect, '-_group -salt -hash');

  User.plugin(mongoosePaginate);

  // keep last
  User.plugin(iglooMongoosePlugin);

  return mongoose.model('User', User);
};

exports['@singleton'] = true;
exports['@require'] = [ 'igloo/settings', 'igloo/mongo', 'igloo/mongoose-plugin' ];
