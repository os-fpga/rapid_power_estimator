// const { _electron: electron } = require('playwright');
// const { test, expect } = require('@playwright/test');

// test('Launch Electron app, add clocking source, navigate to DSP block, configure DSP, and submit form', async () => {
//   const app = await electron.launch({ args: ['main.js'] });
//   const window = await app.firstWindow();

//   // Selecting the device (MPW1 Gemini)
//   const deviceDropdown = await window.waitForSelector('#deviceId');
//   await deviceDropdown.selectOption('MPW1');
//   await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for 2 seconds

//   // Selecting Clocking block
//   const clockingBlockSelector = '#app > div > div.top-row-container > div.main-table-container.main-border > div.top-l2 > div.top-l2-col2 > div.top-l2-col2-elem > div > div:nth-child(2) > div:nth-child(1) > div';
//   const clockingBlock = await window.waitForSelector(clockingBlockSelector);
//   await clockingBlock.click();
//   await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for 2 seconds

//   // Clicking on Add button for Clocking
//   const addButtonSelector = '#app > div > div.table-container.main-border > div > div.power-and-table-wrapper > div.table-wrapper > button';
//   const addButton = await window.waitForSelector(addButtonSelector);
//   await addButton.click();
//   await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for 2 seconds

//   // Ensure modal is visible before interacting
//   const modalSelector = 'body > div:nth-child(3) > div > div.ant-modal-wrap > div';
//   await window.waitForSelector(modalSelector, { state: 'visible', timeout: 5000 }); // Wait for modal

//   // Typing description as 'test'
//   const descriptionSelector = 'body > div:nth-child(3) > div > div.ant-modal-wrap > div > div:nth-child(1) > div > div.ant-modal-body > div > form > div:nth-child(2) > input[type=text]';
//   const descriptionInput = await window.waitForSelector(descriptionSelector);
//   await descriptionInput.click();
//   await descriptionInput.fill('test');
//   await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 1 second

//   // Typing Port/Signal name as 'test'
//   const portSignalSelector = 'body > div:nth-child(3) > div > div.ant-modal-wrap > div > div:nth-child(1) > div > div.ant-modal-body > div > form > div:nth-child(3) > input[type=text]';
//   const portSignalInput = await window.waitForSelector(portSignalSelector);
//   await portSignalInput.click();
//   await portSignalInput.fill('test');
//   await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 1 second

//   // Clicking OK to submit the clocking form
//   const okButtonSelector = 'body > div:nth-child(3) > div > div.ant-modal-wrap > div > div:nth-child(1) > div > div.ant-modal-footer > button.ant-btn.css-dev-only-do-not-override-apn68.ant-btn-primary.ant-btn-color-primary.ant-btn-variant-solid';
//   const okButton = await window.waitForSelector(okButtonSelector);
//   await okButton.click();
//   await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for the form to submit


//   // Navigate to the DSP block
//   const dspBlockSelector = '#app > div > div.top-row-container > div.main-table-container.main-border > div.top-l2 > div.top-l2-col2 > div.top-l2-col2-elem > div > div:nth-child(3) > div:nth-child(2) > div';
//   const dspBlock = await window.waitForSelector(dspBlockSelector);
//   await dspBlock.click();
//   await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for 2 seconds

//   // Clicking on Add button for DSP
//   const addDSPButton = await window.waitForSelector(addButtonSelector); // Reusing the same addButtonSelector
//   await addDSPButton.click();
//   await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for 2 seconds

//   // Typing Name/Hierarchy as 'test'
//   const nameHierarchySelector = 'body > div:nth-child(3) > div > div.ant-modal-wrap > div > div:nth-child(1) > div > div.ant-modal-body > div > form > div:nth-child(1) > input[type=text]';
//   const nameHierarchyInput = await window.waitForSelector(nameHierarchySelector);
//   await nameHierarchyInput.click();
//   await nameHierarchyInput.fill('test');
//   await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 1 second

//   // Typing XX as 32
//   const xxSelector = 'body > div:nth-child(3) > div > div.ant-modal-wrap > div > div:nth-child(1) > div > div.ant-modal-body > div > form > div:nth-child(2) > input[type=number]';
//   const xxInput = await window.waitForSelector(xxSelector);
//   await xxInput.click();
//   await xxInput.fill('32');
//   await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 1 second

//   // Typing A-input width as 64
//   const aInputWidthSelector = 'body > div:nth-child(3) > div > div.ant-modal-wrap > div > div:nth-child(1) > div > div.ant-modal-body > div > form > div:nth-child(4) > input[type=number]';
//   const aInputWidthInput = await window.waitForSelector(aInputWidthSelector);
//   await aInputWidthInput.click();
//   await aInputWidthInput.fill('64');
//   await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 1 second

//   // Typing B-input width as 64
//   const bInputWidthSelector = 'body > div:nth-child(3) > div > div.ant-modal-wrap > div > div:nth-child(1) > div > div.ant-modal-body > div > form > div:nth-child(5) > input[type=number]';
//   const bInputWidthInput = await window.waitForSelector(bInputWidthSelector);
//   await bInputWidthInput.click();
//   await bInputWidthInput.fill('64');
//   await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 1 second

//   // Typing toggle rate as 50
//   const toggleRateSelector = 'body > div:nth-child(3) > div > div.ant-modal-wrap > div > div:nth-child(1) > div > div.ant-modal-body > div > form > div:nth-child(8) > input[type=number]';
//   const toggleRateInput = await window.waitForSelector(toggleRateSelector);
//   await toggleRateInput.click();
//   await toggleRateInput.fill('50');
//   await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 1 second

//   // Take note of the DSP power generated (assuming it's shown in the UI somewhere, you can add the selector for DSP power if needed)

//   // Clicking OK to submit the DSP form
//   const dspOkButtonSelector = 'body > div:nth-child(3) > div > div.ant-modal-wrap > div > div:nth-child(1) > div > div.ant-modal-footer > button.ant-btn.css-dev-only-do-not-override-apn68.ant-btn-primary.ant-btn-color-primary.ant-btn-variant-solid';
//   const dspOkButton = await window.waitForSelector(dspOkButtonSelector);
//   await dspOkButton.click();
//   await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for the form to submit

//   // Closing the test
//   await app.close();
// });
