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
  const clockingBlock = await window.waitForSelector(clockingBlockSelector);
  await clockingBlock.click();

  // Clicking on Add button for Clocking
  const addButtonSelector = '#app > div > div.table-container.main-border > div > div.power-and-table-wrapper > div.table-wrapper > button';
  const addButton = await window.waitForSelector(addButtonSelector);
  await addButton.click();

  // Ensure modal is visible before interacting
  const modalSelector = 'body > div:nth-child(3) > div > div.ant-modal-wrap > div';
  await window.waitForSelector(modalSelector, { state: 'visible' });

  // Typing description as 'test'
  const descriptionSelector = 'body > div:nth-child(3) > div > div.ant-modal-wrap > div > div:nth-child(1) > div > div.ant-modal-body > div > form > div:nth-child(2) > input[type=text]';
  const descriptionInput = await window.waitForSelector(descriptionSelector);
  await descriptionInput.fill('test');

  // Typing Port/Signal name as 'test'
  const portSignalSelector = 'body > div:nth-child(3) > div > div.ant-modal-wrap > div > div:nth-child(1) > div > div.ant-modal-body > div > form > div:nth-child(3) > input[type=text]';
  const portSignalInput = await window.waitForSelector(portSignalSelector);
  await portSignalInput.fill('test');

  // Clicking OK to submit the form
  const modalFooterSelector = 'body > div:nth-child(3) > div > div.ant-modal-wrap > div > div:nth-child(1) > div > div.ant-modal-footer';
  const okButton = await window.locator(`${modalFooterSelector} button.ant-btn-primary`);
  await okButton.click();

  // Navigate to the DSP block
  const dspBlockSelector = '#app > div > div.top-row-container > div.main-table-container.main-border > div.top-l2 > div.top-l2-col2 > div.top-l2-col2-elem > div > div:nth-child(3) > div:nth-child(2) > div';
  const dspBlock = await window.waitForSelector(dspBlockSelector);
  await dspBlock.click();

  // Clicking on Add button for DSP
  const addDSPButton = await window.waitForSelector(addButtonSelector); // Reusing the same addButtonSelector
  await addDSPButton.click();

  // Typing Name/Hierarchy as 'test'
  const nameHierarchySelector = 'body > div:nth-child(3) > div > div.ant-modal-wrap > div > div:nth-child(1) > div > div.ant-modal-body > div > form > div:nth-child(1) > input[type=text]';
  const nameHierarchyInput = await window.waitForSelector(nameHierarchySelector);
  await nameHierarchyInput.fill('test');

  // Typing XX as 32
  const xxSelector = 'body > div:nth-child(3) > div > div.ant-modal-wrap > div > div:nth-child(1) > div > div.ant-modal-body > div > form > div:nth-child(2) > input[type=number]';
  const xxInput = await window.waitForSelector(xxSelector);
  await xxInput.fill('32');

  // Typing A-input width as 64
  const aInputWidthSelector = 'body > div:nth-child(3) > div > div.ant-modal-wrap > div > div:nth-child(1) > div > div.ant-modal-body > div > form > div:nth-child(4) > input[type=number]';
  const aInputWidthInput = await window.waitForSelector(aInputWidthSelector);
  await aInputWidthInput.fill('64');

  // Typing B-input width as 64
  const bInputWidthSelector = 'body > div:nth-child(3) > div > div.ant-modal-wrap > div > div:nth-child(1) > div > div.ant-modal-body > div > form > div:nth-child(5) > input[type=number]';
  const bInputWidthInput = await window.waitForSelector(bInputWidthSelector);
  await bInputWidthInput.fill('64');

  // Typing toggle rate as 50
  const toggleRateSelector = 'body > div:nth-child(3) > div > div.ant-modal-wrap > div > div:nth-child(1) > div > div.ant-modal-body > div > form > div:nth-child(8) > input[type=number]';
  const toggleRateInput = await window.waitForSelector(toggleRateSelector);
  await toggleRateInput.fill('50');

// Define the modal footer selector as the base context
  const dspModalFooterSelector = 'body > div:nth-child(3) > div > div.ant-modal-wrap > div > div:nth-child(1) > div > div.ant-modal-footer';

// Locate the OK button within the modal footer
  const dspOkButton = await window.locator(`${dspModalFooterSelector} button.ant-btn-primary`);

// Click the OK button
  await dspOkButton.click();

  // Closing the test
  await app.close();
});
