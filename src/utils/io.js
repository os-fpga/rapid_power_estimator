export const direction = [
  { id: 0, text: 'Input' },
  { id: 1, text: 'Ouput' },
  { id: 2, text: 'Open-Drain' },
  { id: 3, text: 'Bi-dir' },
];

export const ioStandard = [
  { id: 0, text: 'LVCMOS 1.2V' },
  { id: 1, text: 'LVCMOS 1.5V' },
  { id: 2, text: 'LVCMOS 1.8V (HP)' },
  { id: 3, text: 'LVCMOS 1.8V (HR)' },
  { id: 4, text: 'LVCMOS 2.5V' },
  { id: 5, text: 'LVCMOS 3.3V' },
  { id: 6, text: 'LVTTL' },
  { id: 7, text: 'BLVDS (Diff)' },
  { id: 8, text: 'LVDS (Diff) (HP)' },
  { id: 9, text: 'LVDS (Diff) (HR)' },
  { id: 10, text: 'LVPECL 2.5V (Diff)' },
  { id: 11, text: 'LVPECL 3.3V (Diff)' },
  { id: 12, text: 'HSTL 1.2V Class-I with ODT' },
  { id: 13, text: 'HSTL 1.2V Class-I w/o ODT' },
  { id: 14, text: 'HSTL 1.2V Class-II with ODT' },
  { id: 15, text: 'HSTL 1.2V Class-II w/o ODT' },
  { id: 16, text: 'HSTL 1.2V (Diff)' },
  { id: 17, text: 'HSTL 1.5V Class-I with ODT' },
  { id: 18, text: 'HSTL 1.5V Class-I w/o ODT' },
  { id: 19, text: 'HSTL 1.5V Class-II with ODT' },
  { id: 20, text: 'HSTL 1.5V Class-II w/o ODT' },
  { id: 21, text: 'HSTL 1.5V (Diff)' },
  { id: 22, text: 'HSUL 1.2V' },
  { id: 23, text: 'HSUL 1.2V (Diff)' },
  { id: 24, text: 'MIPI (Diff)' },
  { id: 25, text: 'PCI66' },
  { id: 26, text: 'PCIX133' },
  { id: 27, text: 'POD 1.2V' },
  { id: 28, text: 'POD 1.2V (Diff)' },
  { id: 29, text: 'RSDS (Diff)' },
  { id: 30, text: 'SLVS (Diff)' },
  { id: 31, text: 'SSTL 1.5V Class-I' },
  { id: 32, text: 'SSTL 1.5V Class-II' },
  { id: 33, text: 'SSTL 1.5V (Diff)' },
  { id: 34, text: 'SSTL 1.8V Class-I (HP)' },
  { id: 35, text: 'SSTL 1.8V Class-II (HP)' },
  { id: 36, text: 'SSTL 1.8V (Diff) (HP)' },
  { id: 37, text: 'SSTL 1.8V Class-I (HR)' },
  { id: 38, text: 'SSTL 1.8V Class-II (HR)' },
  { id: 39, text: 'SSTL 2.5V Class-I' },
  { id: 40, text: 'SSTL 2.5V Class-II' },
  { id: 41, text: 'SSTL 3.3V Class-I' },
  { id: 42, text: 'SSTL 3.3V Class-II' },
];

export const driveStrength = [
  { id: 2, text: '2 mA' },
  { id: 4, text: '4 mA' },
  { id: 6, text: '6 mA' },
  { id: 8, text: '8 mA' },
  { id: 12, text: '12 mA' },
  { id: 16, text: '16 mA' },
];

export const bankType = [
  { id: 0, text: 'HP' },
  { id: 1, text: 'HR' },
];

export const slewRate = [
  { id: 0, text: 'Fast' },
  { id: 1, text: 'Slow' },
];

export const differentialTermination = [
  { id: 0, text: 'Off' },
  { id: 1, text: 'On' },
];

export const ioDataType = [
  { id: 0, text: 'SDR' },
  { id: 1, text: 'DDR' },
  { id: 2, text: 'Clock' },
  { id: 3, text: 'Async' },
];

export const synchronization = [
  { id: 0, text: 'None' },
  { id: 1, text: 'Register' },
  { id: 2, text: 'DDR Register' },
  { id: 3, text: '1 to 3 SERDES' },
  { id: 4, text: '1 to 4 SERDES' },
  { id: 5, text: '1 to 5 SERDES' },
  { id: 6, text: '1 to 6 SERDES' },
  { id: 7, text: '1 to 7 SERDES' },
  { id: 8, text: '1 to 8 SERDES' },
  { id: 9, text: '1 to 9 SERDES' },
  { id: 10, text: '1 to 10 SERDES' },
];

export const ioPullUpDown = [
  { id: 0, text: 'None' },
  { id: 1, text: 'Pullup' },
  { id: 2, text: 'Pulldown' },
];
