const { mongoLog, apiLog } = require('../utils/eventLogger');
const Mongoose = require('mongoose');

const options = {
  useNewUrlParser: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
};

const dbConnect = connectionString => {
  Mongoose.connect(connectionString, options);
  const database = Mongoose.connection;
  database.on('connected', () => {
    mongoLog('MongoDB connected');
  });

  database.on('error', err => {
    console.log(err);
  });

  database.on('disconnected', () => {
    mongoLog('MongoDB disconnected');
  });
};

const dbDisconnect = () => Mongoose.disconnect();

module.exports = { dbConnect, dbDisconnect };
