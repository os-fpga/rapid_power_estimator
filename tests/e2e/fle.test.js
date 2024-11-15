const { _electron: electron } = require('playwright');
const { test, expect } = require('@playwright/test');

test('Launch Electron app and click on FLE block', async () => {
  const app = await electron.launch({ args: ['main.js'] });
  const window = await app.firstWindow();

  // Selecting the device (MPW1 Gemini)
  const deviceDropdown = await window.waitForSelector('#deviceId');
  await deviceDropdown.selectOption('MPW1');

  // Clicking on FLE block
  const fleBlockSelector = '#app > div > div.top-row-container > div.main-table-container.main-border > div.top-l2 > div.top-l2-col2 > div.top-l2-col2-elem > div > div:nth-child(2) > div:nth-child(2)';
  await window.click(fleBlockSelector);

  // Verify FLE power visibility
  const flePowerVisible = await window.waitForSelector('div.title-comp-total-text', { state: 'visible' });
  expect(flePowerVisible).toBeTruthy();

  console.log('FLE block clicked and verified.');

  // Close the app
  await app.close();
});
