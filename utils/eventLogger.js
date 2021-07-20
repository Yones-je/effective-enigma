const eventLogger = {
  mongoLog: message => {
    console.log(`🥭 ${new Date().toLocaleString()}: ${message}`);
  },
  apiLog: message => {
    console.log(`🤖 ${new Date().toLocaleString()}: ${message}`);
  },
};

module.exports = eventLogger;
