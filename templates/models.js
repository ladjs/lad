
// # <%= _.dasherize(name).split('-').join(' ') %>

var jsonSelect = require('mongoose-json-select')
var mongoosePaginate = require('mongoose-paginate')

exports = module.exports = function(mongoose, iglooMongoosePlugin) {

  var <%= _.classify(name) %> = new mongoose.Schema({
    name: {
      type: String,
      required: true
    }
  })

  // virtuals
  <%= _.classify(name) %>.virtual('object').get(function() {
    return '<%= _.underscored(name) %>'
  })

  // plugins
  <%= _.classify(name) %>.plugin(jsonSelect, '-_group -salt -hash')
  <%= _.classify(name) %>.plugin(mongoosePaginate)

  // keep last
  <%= _.classify(name) %>.plugin(iglooMongoosePlugin)

  return mongoose.model('<%= _.classify(name) %>', <%= _.classify(name) %>)
}

exports['@singleton'] = true
exports['@require'] = [ 'igloo/mongo', 'igloo/mongoose-plugin' ]
