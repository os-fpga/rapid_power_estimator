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
    // eslint-disable-next-line react/destructuring-assignment
    const elem = map.find((item) => item.id === id);
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
