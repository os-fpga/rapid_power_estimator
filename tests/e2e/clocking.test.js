const { _electron: electron } = require('playwright');
const { test, expect } = require('@playwright/test');

test('Launch Electron app, select device, toggle ACPU power, click Clocking, Add clock source, and submit form', async () => {
  const app = await electron.launch({ args: ['main.js'] });
  const window = await app.firstWindow();

  // Selecting the device (MPW1 Gemini)
  const deviceDropdown = await window.waitForSelector('#deviceId', { timeout: 5000 });
  await deviceDropdown.selectOption('MPW1');

  // Selecting Clocking block
  const clockingBlockSelector = '#app > div > div.top-row-container > div.main-table-container.main-border > div.top-l2 > div.top-l2-col2 > div.top-l2-col2-elem > div > div:nth-child(2) > div:nth-child(1) > div';
  const clockingBlock = await window.waitForSelector(clockingBlockSelector, { timeout: 5000 });
  await clockingBlock.click();

  // Clicking on Add button
  const addButtonSelector = '#app > div > div.table-container.main-border > div > div.power-and-table-wrapper > div.table-wrapper > button';
  const addButton = await window.waitForSelector(addButtonSelector, { timeout: 5000 });
  await addButton.click();

  // Ensure modal is visible before interacting
  const modalSelector = 'body > div:nth-child(3) > div > div.ant-modal-wrap > div';
  await window.waitForSelector(modalSelector, { state: 'visible', timeout: 5000 });

  // Typing description as 'test'
  const descriptionSelector = 'body > div:nth-child(3) > div > div.ant-modal-wrap > div > div:nth-child(1) > div > div.ant-modal-body > div > form > div:nth-child(2) > input[type=text]';
  const descriptionInput = await window.waitForSelector(descriptionSelector, { timeout: 5000 });
  await descriptionInput.fill('test');

  // Typing Port/Signal name as 'test'
  const portSignalSelector = 'body > div:nth-child(3) > div > div.ant-modal-wrap > div > div:nth-child(1) > div > div.ant-modal-body > div > form > div:nth-child(3) > input[type=text]';
  const portSignalInput = await window.waitForSelector(portSignalSelector, { timeout: 5000 });
  await portSignalInput.fill('test');

  // Clicking OK to submit the form
  const okButtonSelector = 'body > div:nth-child(3) > div > div.ant-modal-wrap > div > div:nth-child(1) > div > div.ant-modal-footer > button.ant-btn.css-dev-only-do-not-override-49qm.ant-btn-primary.ant-btn-color-primary.ant-btn-variant-solid';
  await okButton.click();

  // Closing the test
  await app.close();
});
