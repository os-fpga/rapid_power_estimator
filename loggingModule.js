const { app } = require('electron');
const fs = require('fs');
const path = require('path');

const logFilePath = path.join(app.getPath('userData'), 'rpe.log');
const logStream = fs.createWriteStream(logFilePath, { flags: 'a' });

const log = (data) => {
  const logMessage = `${new Date().toISOString()} - ${data}\n`;
  logStream.write(logMessage);
};

const closeLogStream = () => {
  logStream.end();
};

module.exports = { log, closeLogStream };
