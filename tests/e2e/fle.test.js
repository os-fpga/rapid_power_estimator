// const { _electron: electron } = require('playwright');
// const { test, expect } = require('@playwright/test');

// test('Launch Electron app and click on FLE block', async () => {
//   const app = await electron.launch({ args: ['main.js'] });

//   const window = await app.firstWindow();

//     // selecting the device (MPW1 Gemini)
//   const deviceDropdown = await window.waitForSelector('#deviceId');
//   await deviceDropdown.selectOption('MPW1');
//   await new Promise((resolve) => setTimeout(resolve, 2000));

//   const fleBlock = await window.waitForSelector('#app > div > div.top-row-container > div.main-table-container.main-border > div.top-l2 > div.top-l2-col2 > div.top-l2-col2-elem > div > div:nth-child(2) > div:nth-child(2) > div');
//   await fleBlock.click();

//   const flePowerVisible = await window.isVisible('div.title-comp-total-text');
//   expect(flePowerVisible).toBeTruthy();

//   console.log('FLE block clicked and verified.');

//   await new Promise((resolve) => setTimeout(resolve, 5000));

//   await app.close();
// });
