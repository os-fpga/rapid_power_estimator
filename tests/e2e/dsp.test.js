const { _electron: electron } = require('playwright');
const { test, expect } = require('@playwright/test');

test('Launch Electron app, add clocking source, navigate to DSP block, configure DSP, and submit form', async () => {
  const app = await electron.launch({ args: ['main.js'] });
  const window = await app.firstWindow();

  // Select the device (MPW1 Gemini)
  await window.selectOption('#deviceId', 'MPW1');

  // Select Clocking block and click Add
  await window.click('#app > div > div.top-row-container > div.main-table-container.main-border > div.top-l2 > div.top-l2-col2 > div.top-l2-col2-elem > div > div:nth-child(2) > div:nth-child(1) > div');
  await window.click('#app > div > div.table-container.main-border > div > div.power-and-table-wrapper > div.table-wrapper > button');

  // Fill and submit Clocking form
  await window.fill('body > div:nth-child(3) > div > div.ant-modal-wrap > div > div:nth-child(1) > div > div.ant-modal-body > div > form > div:nth-child(2) > input[type=text]', 'test');
  await window.fill('body > div:nth-child(3) > div > div.ant-modal-wrap > div > div:nth-child(1) > div > div.ant-modal-body > div > form > div:nth-child(3) > input[type=text]', 'test');
  await window.click('body > div:nth-child(3) > div > div.ant-modal-wrap > div > div:nth-child(1) > div > div.ant-modal-footer > button.ant-btn-primary');

  // Navigate to DSP block and click Add
  await window.click('#app > div > div.top-row-container > div.main-table-container.main-border > div.top-l2 > div.top-l2-col2 > div.top-l2-col2-elem > div > div:nth-child(3) > div:nth-child(2) > div');
  await window.click('#app > div > div.table-container.main-border > div > div.power-and-table-wrapper > div.table-wrapper > button');

  // Fill and submit DSP form
  await Promise.all([
    window.fill('body > div:nth-child(3) > div > div.ant-modal-wrap > div > div:nth-child(1) > div > div.ant-modal-body > div > form > div:nth-child(1) > input[type=text]', 'test'),
    window.fill('body > div:nth-child(3) > div > div.ant-modal-wrap > div > div:nth-child(1) > div > div.ant-modal-body > div > form > div:nth-child(2) > input[type=number]', '32'),
    window.fill('body > div:nth-child(3) > div > div.ant-modal-wrap > div > div:nth-child(1) > div > div.ant-modal-body > div > form > div:nth-child(4) > input[type=number]', '64'),
    window.fill('body > div:nth-child(3) > div > div.ant-modal-wrap > div > div:nth-child(1) > div > div.ant-modal-body > div > form > div:nth-child(5) > input[type=number]', '64'),
    window.fill('body > div:nth-child(3) > div > div.ant-modal-wrap > div > div:nth-child(1) > div > div.ant-modal-body > div > form > div:nth-child(8) > input[type=number]', '50')
  ]);
  await window.click('body > div:nth-child(3) > div > div.ant-modal-wrap > div > div:nth-child(1) > div > div.ant-modal-footer > button.ant-btn-primary');

  // Close the test
  await app.close();
});
