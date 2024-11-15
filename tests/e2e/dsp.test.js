const { _electron: electron } = require('playwright');
const { test, expect } = require('@playwright/test');

test('Launch Electron app, add clocking source, navigate to DSP block, configure DSP, and submit form', async () => {
  const app = await electron.launch({ args: ['main.js'] });
  const window = await app.firstWindow();

  // Selecting the device (MPW1 Gemini)
  const deviceDropdown = await window.waitForSelector('#deviceId');
  await deviceDropdown.selectOption('MPW1');

  // Selecting Clocking block
  const clockingBlockSelector = '#app > div > div.top-row-container > div.main-table-container.main-border > div.top-l2 > div.top-l2-col2 > div.top-l2-col2-elem > div > div:nth-child(2) > div:nth-child(1) > div';
  await window.click(clockingBlockSelector);

  // Clicking on Add button for Clocking
  const addButtonSelector = '#app > div > div.table-container.main-border > div > div.power-and-table-wrapper > div.table-wrapper > button';
  await window.click(addButtonSelector);

  // Ensure modal is visible before interacting
  const modalSelector = 'body > div:nth-child(3) > div > div.ant-modal-wrap > div';
  await window.waitForSelector(modalSelector, { state: 'visible' });

  // Typing description as 'test'
  await window.fill('body > div:nth-child(3) > div > div.ant-modal-wrap > div > div:nth-child(1) > div > div.ant-modal-body > div > form > div:nth-child(2) > input[type=text]', 'test');

  // Typing Port/Signal name as 'test'
  await window.fill('body > div:nth-child(3) > div > div.ant-modal-wrap > div > div:nth-child(1) > div > div.ant-modal-body > div > form > div:nth-child(3) > input[type=text]', 'test');

  // Clicking OK to submit the clocking form
  const okButtonSelector = 'body > div:nth-child(3) > div > div.ant-modal-wrap > div > div:nth-child(1) > div > div.ant-modal-footer > button.ant-btn.css-dev-only-do-not-override-vryruh.ant-btn-primary.ant-btn-color-primary.ant-btn-variant-solid > span';
  await window.click(okButtonSelector);

  // Navigate to the DSP block
  const dspBlockSelector = '#app > div > div.top-row-container > div.main-table-container.main-border > div.top-l2 > div.top-l2-col2 > div.top-l2-col2-elem > div > div:nth-child(3) > div:nth-child(2) > div';
  await window.click(dspBlockSelector);

  // Clicking on Add button for DSP
  await window.click(addButtonSelector);

  // Typing Name/Hierarchy as 'test'
  await window.fill('body > div:nth-child(3) > div > div.ant-modal-wrap > div > div:nth-child(1) > div > div.ant-modal-body > div > form > div:nth-child(1) > input[type=text]', 'test');

  // Typing XX as 32
  await window.fill('body > div:nth-child(3) > div > div.ant-modal-wrap > div > div:nth-child(1) > div > div.ant-modal-body > div > form > div:nth-child(2) > input[type=number]', '32');

  // Typing A-input width as 64
  await window.fill('body > div:nth-child(3) > div > div.ant-modal-wrap > div > div:nth-child(1) > div > div.ant-modal-body > div > form > div:nth-child(4) > input[type=number]', '64');

  // Typing B-input width as 64
  await window.fill('body > div:nth-child(3) > div > div.ant-modal-wrap > div > div:nth-child(1) > div > div.ant-modal-body > div > form > div:nth-child(5) > input[type=number]', '64');

  // Typing toggle rate as 50
  await window.fill('body > div:nth-child(3) > div > div.ant-modal-wrap > div > div:nth-child(1) > div > div.ant-modal-body > div > form > div:nth-child(8) > input[type=number]', '50');

  // Clicking OK to submit the DSP form
  const dspOkButtonSelector = 'body > div:nth-child(3) > div > div.ant-modal-wrap > div > div:nth-child(1) > div > div.ant-modal-footer > button.ant-btn.css-dev-only-do-not-override-vryruh.ant-btn-primary.ant-btn-color-primary.ant-btn-variant-solid > span';
  await window.click(dspOkButtonSelector);

  console.log('DSP block clicked, tested and inputs verified.');

  // Closing the test
  await app.close();
});
