const config = require('../../rpe.config.json');

const { server } = config;
let { port } = config;

export function devices() {
  return `${server}:${port}/devices`;
}

export function attributes() {
  return `${server}:${port}/attributes`;
}

export function project() {
  return `${server}:${port}/project`;
}

export function projectClose() {
  return `${project()}/close`;
}

export function projectOpen() {
  return `${project()}/open`;
}

export function projectSave() {
  return `${project()}/create`;
}

export function setPort(p, fetchDevices) {
  if (p !== undefined) {
    port = p;
    GET(devices(), fetchDevices);
  }
}

export function peripheralPath(deviceId, url) {
  return `${devices()}/${deviceId}/peripherals/${url}`;
}

export function deviceInfo(deviceId) {
  return `${devices()}/${deviceId}`;
}

export const Elem = {
  clocking: 'clocking',
  io: 'io',
  bram: 'bram',
  dsp: 'dsp',
  fle: 'fabric_le',
  peripherals: 'peripherals',
};

export const api = {
  fetch(func, deviceId) {
    return `${devices()}/${deviceId}/${func}`;
  },

  consumption(func, deviceId) {
    return `${devices()}/${deviceId}/${func}/consumption`;
  },

  index(func, deviceId, index) {
    return `${devices()}/${deviceId}/${func}/${index}`;
  },
};

export function POST(url, data, callback) {
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then((response) => {
    if (response.ok) {
      if (callback) callback();
    }
  });
}

export function DELETE(url, callback) {
  fetch(url, {
    method: 'DELETE',
  }).then((response) => {
    if (response.ok) {
      if (callback) callback();
    }
  });
}

export function PATCH(url, data, callback) {
  fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then((response) => {
    if (response.ok) {
      if (callback) callback();
    } else {
      // TODO: handle error
    }
  });
}

export function GET(url, callback) {
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      if (callback) callback(data);
    });
}

// function to call the shutdown API
export function shutdown(callback) {
  const shutdownUrl = 'http://localhost:5000/shutdown';
  POST(shutdownUrl, null, callback);
}
