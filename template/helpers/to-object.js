const ObjectID = require('bson-objectid');
const _ = require('lodash');

function toObject(Model, doc) {
  if (_.isUndefined(Model) || _.isUndefined(doc))
    throw new Error('Model and doc are required');
  if (ObjectID.isValid(doc)) return doc;
  if (_.isFunction(doc.toObject)) return doc.toObject();
  return new Model(doc).toObject();
}

module.exports = toObject;
