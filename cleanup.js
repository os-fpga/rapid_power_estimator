const axios = require('axios');
const isWindows = process.platform === 'win32';

const kill = async (process) => {
  try {
    // Call the shutdown API
    await axios.post('http://localhost:5000/shutdown');
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
