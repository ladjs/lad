
// # user

var jsonSelect = require('mongoose-json-select')
var passportLocalMongoose = require('passport-local-mongoose')
var validator = require('validator')
var mongoosePaginate = require('mongoose-paginate')
var mongoose = require('mongoose')

exports = module.exports = function(mongo, iglooMongoosePlugin) {

  var User = new mongoose.Schema({
    email: {
      type: String,
      required: true,
      unique: true,
      validate: validator.isEmail
    }
  })

  // virtuals

  User.virtual('object').get(function() {
    return 'user'
  })

  // plugins

  User.plugin(passportLocalMongoose, {
    usernameField: 'email',
    usernameLowerCase: true
  })

  User.plugin(jsonSelect, '-_group -salt -hash')

  User.plugin(mongoosePaginate)

  // keep last
  User.plugin(iglooMongoosePlugin)

  return mongo.model('User', User)
}

exports['@singleton'] = true
exports['@require'] = [ 'igloo/mongo', 'igloo/mongoose-plugin' ]
