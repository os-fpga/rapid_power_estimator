// const { _electron: electron } = require('playwright');
// const { test, expect } = require('@playwright/test');
// const { execSync } = require('child_process');
// const os = require('os');

// function isElectronRunning(pid) {
//   try {
//     const platform = os.platform();
//     let output;

//     if (platform === 'win32') {
//       output = execSync(`tasklist /FI "PID eq ${pid}"`).toString();
//       return output.includes('electron.exe');
//     } else if (platform === 'darwin' || platform === 'linux') {
//       output = execSync(`ps -p ${pid}`).toString();
//       return output.includes('Electron');
//     }
//   } catch (error) {
//     console.error('Error checking for Electron process:', error);
//     return false;
//   }
// }

// test('Launch and close Electron app 10 times', async () => {
//   for (let i = 0; i < 10; i++) {
//     console.log(`Iteration ${i + 1}: Launching and closing Electron app.`);

//     // Launch the Electron app
//     const app = await electron.launch({ args: ['main.js'] });
//     const pid = app.process().pid;
//     const window = await app.firstWindow();

//       // Selecting the device (MPW1 Gemini)
//   const deviceDropdown = await window.waitForSelector('#deviceId');
//   await deviceDropdown.selectOption('MPW1');


//     // Close the app
//     await app.close();

//     // Waiting for a moment to allow for process termination
//     await new Promise((resolve) => setTimeout(resolve, 3000)); 

//     // Check if the Electron app is still running
//     let running = isElectronRunning(pid);
//     if (running) {
//       console.error(`Iteration ${i + 1}: Electron app could not be terminated.`);
//       break; // Stop further iterations if the app cannot be killed
//     }
//   }
// });
