
// # models - user

var jsonSelect = require('mongoose-json-select')
var passportLocalMongoose = require('passport-local-mongoose')

exports = module.exports = function(db, iglooMongoosePlugin) {

  var Email = db.SchemaTypes.Email

  var User = new db.Schema({
    email: {
      type: Email,
      required: true,
      unique: true
    }
  })

  // virtuals

  User.virtual('type').get(function() {
    return 'User'
  })

  // plugins

  User.plugin(passportLocalMongoose, {
    usernameField: 'email',
    usernameLowerCase: true,
    userExistsError: 'User already exists with email %s'
  })

  User.plugin(jsonSelect, '-_group -salt -hash')

  // keep last
  User.plugin(iglooMongoosePlugin)

  return db.model('User', User)
}

exports['@singleton'] = true
exports['@require'] = [ 'igloo/db', 'igloo/mongoose-plugin' ]
