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

export function findEvailableIndex(array) {
  const found = array.find((item) => item.data !== undefined && item.data.name === '');
  if (found) return found.ep;
  return 0;
}
