var IoC = require('electrolyte');
var path = require('path');
var fs = require('fs');
var async = require('async');

var modelsPath = path.join(__dirname, '..', 'app', 'models');

var files = fs.readdirSync(modelsPath);
var models = [];
for (var i = 0; i < files.length; i++) {
  var model = IoC.create('models/'+path.basename(files[i], '.js'));
  models.push(model);
}

exports.cleanDatabase = function(callback) {
  async.eachSeries(models, function(model, next) {
    model.remove({}, next);
  }, callback);
};
