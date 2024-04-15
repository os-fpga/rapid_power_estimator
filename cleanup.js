const isWindows = process.platform === 'win32';

const kill = (process) => {
  if (isWindows) {
    const kill = require('tree-kill');
    kill(process.pid);
  } else {
    process.kill('SIGINT');
  }
};

module.exports = { kill };
