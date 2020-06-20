const ObjectID = require('bson-objectid');
const _ = require('lodash');

function toObject(Model, doc) {
  if (_.isUndefined(Model) || _.isUndefined(doc))
    throw new Error('Model and doc are required');
  return ObjectID.isValid(doc)
    ? doc
    : _.isFunction(doc.toObject)
    ? doc.toObject()
    : new Model(doc).toObject();
}

module.exports = toObject;
