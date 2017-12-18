const { promisify } = require('util');
const mongoose = require('@ladjs/mongoose');

const before = async () => {
  mongoose.configure();
  await mongoose.connect();
  await promisify(mongoose.connection.db.dropDatabase).bind(mongoose.connection.db)();
};

const after = async () => {
  await promisify(mongoose.connection.db.dropDatabase).bind(mongoose.connection.db)();
};

module.exports = { before, after };
