const { _electron: electron } = require('playwright');
const { test, expect } = require('@playwright/test');

test('Launch Electron app, select device, toggle ACPU power, click Clocking, Add clock source, and submit form', async () => {
  const app = await electron.launch({ args: ['main.js'] });
  const window = await app.firstWindow();

  // Selecting the device (MPW1 Gemini)
  const deviceDropdown = await window.waitForSelector('#deviceId');
  await deviceDropdown.selectOption('MPW1');
  await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for 2 seconds

  // Selecting Clocking block
  const clockingBlockSelector = '#app > div > div.top-row-container > div.main-table-container.main-border > div.top-l2 > div.top-l2-col2 > div.top-l2-col2-elem > div > div:nth-child(2) > div:nth-child(1) > div';
  const clockingBlock = await window.waitForSelector(clockingBlockSelector);
  await clockingBlock.click();
  await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for 2 seconds

  // Clicking on Add button
  const addButtonSelector = '#app > div > div.table-container.main-border > div > div.power-and-table-wrapper > div.table-wrapper > button';
  const addButton = await window.waitForSelector(addButtonSelector);
  await addButton.click();
  await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for 2 seconds

  // Ensure modal is visible before interacting
  const modalSelector = 'body > div:nth-child(3) > div > div.ant-modal-wrap > div';
  await window.waitForSelector(modalSelector, { state: 'visible', timeout: 5000 }); // Wait for modal

  // Typing description as 'test'
  const descriptionSelector = 'body > div:nth-child(3) > div > div.ant-modal-wrap > div > div:nth-child(1) > div > div.ant-modal-body > div > form > div:nth-child(2) > input[type=text]';
  const descriptionInput = await window.waitForSelector(descriptionSelector);
  await descriptionInput.click();
  await descriptionInput.fill('test');
  await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 1 second

  // Typing Port/Signal name as 'test'
  const portSignalSelector = 'body > div:nth-child(3) > div > div.ant-modal-wrap > div > div:nth-child(1) > div > div.ant-modal-body > div > form > div:nth-child(3) > input[type=text]';
  const portSignalInput = await window.waitForSelector(portSignalSelector);
  await portSignalInput.click();
  await portSignalInput.fill('test');
  await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 1 second

  // Clicking OK to submit the form
  const modalFooterSelector = 'body > div:nth-child(3) > div > div.ant-modal-wrap > div > div:nth-child(1) > div > div.ant-modal-footer';
  const okButton = await window.locator(`${modalFooterSelector} button.ant-btn-primary`);
  await okButton.click();
  

  // Closing the test
  await app.close();
});

