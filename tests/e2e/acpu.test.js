// const { _electron: electron } = require('playwright');
// const { test, expect } = require('@playwright/test');

// test('Launch Electron app, select device, toggle ACPU power, and click Add', async () => {
//   const app = await electron.launch({ args: ['main.js'] });
//   const window = await app.firstWindow();

//   // Selecting the device (MPW1 Gemini)
//   const deviceDropdown = await window.waitForSelector('#deviceId');
//   await deviceDropdown.selectOption('MPW1');

//   // Clicking on ACPU block
//   const acpuBlockSelector = '#app > div > div.top-row-container > div.main-table-container.main-border > div.top-l2 > div.top-l2-col1 > div.top-l2-col1-row1 > div:nth-child(1) > div';
//   await window.click(acpuBlockSelector);

//   // Toggling ACPU power
//   const acpuPowerToggleSelector = '#app > div > div.table-container.main-border > div > div.toggle-container > label.toggle-switch > span';
//   await window.click(acpuPowerToggleSelector);

//   // Click on Add button
//   const addButtonSelector = '#app > div > div.table-container.main-border > div > div.cpu-container > div.table-wrapper > button';
//   await window.click(addButtonSelector);

//   // Click OK in the popup
//   const okButtonSelector = 'body > div:nth-child(3) > div > div.ant-modal-wrap > div > div:nth-child(1) > div > div.ant-modal-footer > button.ant-btn.css-dev-only-do-not-override-vryruh.ant-btn-primary.ant-btn-color-primary.ant-btn-variant-solid > span';
//   await window.click(okButtonSelector);

//   console.log('ACPU power and verified.');

//   await app.close();
// });
