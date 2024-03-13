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
};

export function percentage(val, sum) {
  return fixed((val / sum) * 100, 0);
}
