export const Table = {
  Clocking: 0,
  FLE: 1,
  IO: 2,
  Peripherals: 3,
  Connectivity: 4,
  DSP: 5,
  BRAM: 6,
  ACPU: 7,
  Memory: 8,
  BCPU: 9,
  DMA: 10,
  Summary: 11,
};

export const formatString = (template, ...args) => template.replace(/{([0-9]+)}/g, (match, index) => (typeof args[index] === 'undefined' ? match : args[index]));

export const fixed = (number, precition = 3) => number.toFixed(precition);

export function GetText(id, map) {
  try {
    const tmp = map;
    const elem = tmp.find((item) => item.id === id);
    if (elem) return elem.text;
  } catch (error) {
    return null;
  }
  return null;
}

export const FieldType = {
  textarea: 0,
  select: 1,
  number: 2,
  float: 3,
  selectClock: 4,
};

export function color(error = false, warning = false, info = false) {
  if (error) return '#F288A8';
  if (warning) return '#EFDB94';
  if (info) return '#3385FF';
  return '#9fdda9';
}

export function getPerformance(object) {
  if (object.clock_frequency) return object.clock_frequency;
  if (object.baudrate) return object.baudrate;
  if (object.bit_rate) return object.bit_rate;
  if (object.io_standard) return object.io_standard;
  return 0;
}

export function getPeripherals(peripherals, type) {
  return peripherals.filter((item) => item.type === type);
}

export function findEvailableIndex(array) {
  const found = array.find((item) => item.data !== undefined && item.data.name === '');
  if (found) return found.ep;
  return 0;
}
