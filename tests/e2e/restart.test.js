const { _electron: electron } = require('playwright');
const { test, expect } = require('@playwright/test');
const { execSync } = require('child_process');
const os = require('os');

// Helper function to find a process ID by name
function getProcessIdByName(processName,pid) {
  try {
    const platform = os.platform();
    let output;

    if (platform === 'win32') {
      // Fetch all processes
      output = execSync(`tasklist /FO CSV`).toString();
      const lines = output.split('\n');
      for (const line of lines) {
        if (line.includes(processName)) {
          const parts = line.split(',');
          const pid = parseInt(parts[1].replace(/"/g, '').trim(), 10);
          console.log(`Found process: ${line}`);
          return pid; // Return the PID of the process
        }
      }
    } else if (platform === 'darwin' || platform === 'linux') {
      // Fetch the PID for Unix-based systems
      output = execSync(`pgrep "${processName}" -P ${pid}`).toString();
      console.log(`Found backend PID: ${output.trim()}`);
      return parseInt(output.trim(), 10); // Return the PID
    }
  } catch (error) {
    console.error(`Error fetching process ID for ${processName}:`, error.message);
    return null;
  }
}

// Helper function to check if a process is running by PID
function isProcessRunning(pid) {
  try {
    const platform = os.platform();
    let output;

    if (platform === 'win32') {
      output = execSync(`tasklist /FI "PID eq ${pid}"`).toString();
      return output.includes(`${pid}`);
    } else if (platform === 'darwin' || platform === 'linux') {
      output = execSync(`ps -aux | grep ${pid}`).toString();
      return output.includes(`main.js`);
    }
  } catch (error) {
    console.error(`Error checking for process ${pid}:`, error.message);
    return false;
  }
}

test('Launch and close Electron app 10 times, ensuring backend termination', async () => {
  for (let i = 0; i < 10; i++) {
    console.log(`Iteration ${i + 1}: Launching and closing Electron app.`);

    // Launch the Electron app
    const app = await electron.launch({ args: ['main.js'] });
    const pid = app.process().pid;
    const window = await app.firstWindow();
    console.log(`Frontend PID: ${pid}`)
    // Selecting the device (MPW1 Gemini)
    const deviceDropdown = await window.waitForSelector('#deviceId');
    await deviceDropdown.selectOption('MPW1');

    let backendProcessName = '';
    if (os.platform() === 'win32') {
        backendProcessName = 'python.exe';
    } else if (os.platform() === 'darwin' || os.platform() === 'linux') {
      backendProcessName = 'python';
    }
    console.log(`The backend process name is: ${backendProcessName}`);
    const backendPid = getProcessIdByName(backendProcessName,pid);
    if (!backendPid) {
      console.error('Failed to fetch backend PID.');
      break;
    }
    console.log(`Backend PID: ${backendPid}`);
    // Close the Electron app
    await app.close();
    // Wait for a moment to allow processes to terminate
   await new Promise((resolve) => setTimeout(resolve, 3000));
    // Check if the Electron app is still running
    let frontendRunning = isProcessRunning(pid);
    if (frontendRunning) {
      console.error(`Iteration ${i + 1}: Electron app could not be terminated.`);
      break;
    }
    // Check if the backend process is still running
    let backendRunning = isProcessRunning(backendPid);
    if (backendRunning) {
      console.error(
        `Iteration ${i + 1}: Backend process ${backendPid} could not be terminated.`
      );
      break;
    } else {
      console.log(`Iteration ${i + 1}: Backend process terminated successfully.`);
    }
  }
});
