const { _electron: electron } = require('playwright');
const { test, expect } = require('@playwright/test');

test('Launch Electron app, select device MPW1 Gemini, and click on BCPU block', async () => {
  const app = await electron.launch({ args: ['main.js'], headless: false });

  const window = await app.firstWindow();

  // selecting MPW1 Gemini from device dropdown
  const deviceDropdown = await window.waitForSelector('#deviceId');
  await deviceDropdown.selectOption('MPW1');
  await window.waitForTimeout(2000); // wait for UI update

  // click on the BCPU block
  const bcpuSelector = '#app > div > div.top-row-container > div.main-table-container.main-border > div.top-l2 > div.top-l2-col1 > div.top-l2-col1-row1 > div:nth-child(2) > div';
  await window.waitForSelector(bcpuSelector); 
  await window.click(bcpuSelector); 

  // click on "Add" button
  const addButtonSelector = '#app > div > div.table-container.main-border > div > div.cpu-container > div.table-wrapper > button';
  await window.waitForSelector(addButtonSelector, { state: 'visible' });
  await window.click(addButtonSelector); 

  // click on "OK" button
  const okButtonSelector = 'button.ant-btn-primary';
  await window.waitForSelector(okButtonSelector, { state: 'visible' });
  await window.click(okButtonSelector);

  // click on Peripherals tab
  const peripheralsTabSelector = '#app > div > div.top-row-container > div.main-table-container.main-border > div.top-l2 > div.top-l2-col1 > div:nth-child(3) > div > div:nth-child(2) > div:nth-child(2) > div.periph-internal-font-header';
  await window.waitForSelector(peripheralsTabSelector, { state: 'visible' });
  await window.click(peripheralsTabSelector);

  // check SPI/QSPI block
  const spiQspiCheckSelector = '#\\30';
  await window.waitForSelector(spiQspiCheckSelector, { state: 'visible' });
  await window.click(spiQspiCheckSelector);

  // waiting to observe result on UI
  await window.waitForTimeout(5000);

  // closing RPE
  await app.close();
});
