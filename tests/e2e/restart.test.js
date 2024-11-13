const { _electron: electron } = require('playwright');
const { test, expect } = require('@playwright/test');
const { execSync } = require('child_process');
const os = require('os');

function isElectronRunning(pid) {
  try {
    const platform = os.platform();
    let output;

    if (platform === 'win32') {
      output = execSync(`tasklist /FI "PID eq ${pid}"`).toString();
      return output.includes('electron.exe');
    } else if (platform === 'darwin' || platform === 'linux') {
      output = execSync(`ps -p ${pid}`).toString();
      return output.includes('Electron');
    }
  } catch (error) {
    console.error('Error checking for Electron process:', error);
    return false;
  }
}

function forceKillElectron(pid) {
  try {
    const platform = os.platform();

    if (platform === 'win32') {
      execSync(`taskkill /PID ${pid} /F`);
    } else if (platform === 'darwin' || platform === 'linux') {
      process.kill(pid, 'SIGKILL');
    }
    console.log('Electron process forcefully terminated.');
  } catch (error) {
    console.error('Error forcefully terminating Electron process:', error);
  }
}

test('Launch and close Electron app 10 times', async () => {
  for (let i = 0; i < 10; i++) {
    console.log(`Iteration ${i + 1}: Launching and closing Electron app.`);

    // Launch the Electron app
    const app = await electron.launch({ args: ['main.js'] });
    const pid = app.process().pid;
    const window = await app.firstWindow();

    // Close the app
    await app.close();

    // Waiting for a moment to allow for process termination
    await new Promise((resolve) => setTimeout(resolve, 3000)); 

    // Check if the Electron app is still running
    let running = isElectronRunning(pid);
    if (running) {
      console.warn(`Iteration ${i + 1}: Electron app is still running. Attempting to force kill.`);
      forceKillElectron(pid);

      // Re-check if the process is still running after the forced kill
      running = isElectronRunning(pid);
    }

    // Assert that the app is not running
    expect(running).toBeFalsy();

    if (!running) {
      console.log(`Iteration ${i + 1}: Electron app closed successfully.`);
    } else {
      console.error(`Iteration ${i + 1}: Electron app could not be terminated.`);
      break; // Stop further iterations if the app cannot be killed
    }
  }
});
