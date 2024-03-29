export const loadActivity = [
  { id: 0, text: 'Idle' },
  { id: 1, text: 'Low' },
  { id: 2, text: 'Medium' },
  { id: 3, text: 'High' },
];

export const acpuNames = [
  { id: 0, text: 'DDR' },
  { id: 1, text: 'UART1 (ACPU)' },
  { id: 2, text: 'USB 2.0' },
  { id: 3, text: 'SPI/QSPI' },
  { id: 4, text: 'GigE' },
  { id: 5, text: 'JTAG' },
  { id: 6, text: 'I2C' },
];

export const bcpuNames = [
  { id: 0, text: 'DDR' },
  { id: 1, text: 'UART0 (BCPU)' },
  { id: 2, text: 'SPI/QSPI' },
  { id: 3, text: 'JTAG' },
];

export const connectivityNames = [
  { id: 0, text: 'DDR' },
  { id: 1, text: 'SPI/QSPI' },
  { id: 2, text: 'GigE' },
  { id: 3, text: 'I2C' },
];

export const clock = [
  { id: 0, text: 'PLL (233 MHz)' },
  { id: 1, text: 'BOOT_CLK (40 MHz)' },
  { id: 2, text: 'RC OSC (50 MHz)' },
];

export const source = [
  { id: 0, text: 'NONE' },
  { id: 1, text: 'DDR' },
  { id: 2, text: 'OCM' },
  { id: 3, text: 'SPI_QSPI' },
  { id: 4, text: 'I2C' },
  { id: 5, text: 'Fabric' },
];

export function findEvailableIndex(array) {
  const found = array.find((item) => item.data !== undefined && item.data.name === '');
  if (found) return found.ep;
  return 0;
}
