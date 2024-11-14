const { shutdown } = require('./src/utils/serverAPI');
const isWindows = process.platform === 'win32';

const kill = async (process) => {
  try {
    // calling the shutdown API
    await shutdown();
    console.log('Shutdown API called successfully.');
  } catch (error) {
    console.error('Error calling shutdown API:', error);
  }

  // Fallback if API fails or for local process termination
  if (isWindows) {
    const kill = require('tree-kill');
    kill(process.pid);
  } else {
    process.kill('SIGINT');
  }
};

module.exports = { kill };
