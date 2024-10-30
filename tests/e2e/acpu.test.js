const { _electron: electron } = require('playwright');
const { test, expect } = require('@playwright/test');

test('Launch Electron app, select device, toggle ACPU power, and click Add slowly', async () => {
  const app = await electron.launch({ args: ['main.js'] });

  const window = await app.firstWindow();

  // selecting the device (MPW1 Gemini)
  const deviceDropdown = await window.waitForSelector('#deviceId');
  await deviceDropdown.selectOption('MPW1');
  await new Promise((resolve) => setTimeout(resolve, 2000)); // wait 2 seconds (not really needed, just for demo)

  // clicking on ACPU block
  const acpuBlock = await window.waitForSelector('#app > div > div.top-row-container > div.main-table-container.main-border > div.top-l2 > div.top-l2-col1 > div.top-l2-col1-row1 > div:nth-child(1) > div');
  await acpuBlock.click();
  await new Promise((resolve) => setTimeout(resolve, 2000)); 

  // toggling ACPU power, basically turning on the power on
  const acpuPowerToggle = await window.waitForSelector('#app > div > div.table-container.main-border > div > div.toggle-container > label.toggle-switch > span');
  await acpuPowerToggle.click();
  await new Promise((resolve) => setTimeout(resolve, 2000)); 

  // Click on Add button
  const addButton = await window.waitForSelector('#app > div > div.table-container.main-border > div > div.cpu-container > div.table-wrapper > button');
  await addButton.click();
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Click OK in the popup
  const okButton = await window.waitForSelector('body > div:nth-child(3) > div > div.ant-modal-wrap > div > div:nth-child(1) > div > div.ant-modal-footer > button.ant-btn.css-dev-only-do-not-override-apn68.ant-btn-primary.ant-btn-color-primary.ant-btn-variant-solid > span');
  await okButton.click();
  await new Promise((resolve) => setTimeout(resolve, 2000)); 

  console.log('Test case executed successfully.');

  await app.close();
});
