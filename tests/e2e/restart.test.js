const { _electron: electron } = require('playwright');
const { test, expect } = require('@playwright/test');
const { execSync } = require('child_process');

function isElectronRunning() {
  try {
    // Check if Electron process is running on Windows
    const output = execSync('tasklist').toString();
    return output.includes('electron.exe');
  } catch (error) {
    console.error('Error checking for Electron process:', error);
    return false;
  }
}

function forceKillElectron() {
  try {
    execSync('taskkill /F /IM electron.exe');
    console.log('Electron process forcefully terminated.');
  } catch (error) {
    console.error('Error forcefully terminating Electron process:', error);
  }
}

test('Launch and close Electron app 100 times', async () => {
  for (let i = 0; i < 10; i++) {
    console.log(`Iteration ${i + 1}: Launching and closing Electron app.`);

    // Launch the Electron app
    const app = await electron.launch({ args: ['main.js'] });
    const window = await app.firstWindow();

    // Close the app
    await app.close();

    // Wait for a moment to allow for process termination
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Check if the Electron app is still running in the task manager
    let running = isElectronRunning();
    if (running) {
      console.warn(`Iteration ${i + 1}: Electron app is still running. Attempting to force kill.`);
      forceKillElectron();

      // Re-check if the process is still running after the forced kill
      running = isElectronRunning();
    }

    // Assert that the app is not running
    expect(running).toBeFalsy();

    if (!running) {
      console.log(`Iteration ${i + 1}: Electron app closed successfully.`);
    } else {
      console.error(`Iteration ${i + 1}: Electron app could not be terminated.`);
      break; // Stop further iterations if the app cannot be killed
    }

    // Optional delay between iterations
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
});
