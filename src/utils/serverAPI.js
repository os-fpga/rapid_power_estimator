const config = require('../../rpe.config.json');
const { server } = config;
let { port } = config;

function devices() {
  return `${server}:${port}/devices`;
}

function attributes() {
  return `${server}:${port}/attributes`;
}

function project() {
  return `${server}:${port}/project`;
}

function projectClose() {
  return `${project()}/close`;
}

function projectOpen() {
  return `${project()}/open`;
}

function projectSave() {
  return `${project()}/create`;
}

function setPort(p, fetchDevices) {
  if (p !== undefined) {
    port = p;
    GET(devices(), fetchDevices);
  }
}

function peripheralPath(deviceId, url) {
  return `${devices()}/${deviceId}/peripherals/${url}`;
}

function deviceInfo(deviceId) {
  return `${devices()}/${deviceId}`;
}

const Elem = {
  clocking: 'clocking',
  io: 'io',
  bram: 'bram',
  dsp: 'dsp',
  fle: 'fabric_le',
  peripherals: 'peripherals',
};

const api = {
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

function POST(url, data, callback) {
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then((response) => {
    if (response.ok && callback) callback();
  });
}

function DELETE(url, callback) {
  fetch(url, {
    method: 'DELETE',
  }).then((response) => {
    if (response.ok && callback) callback();
  });
}

function PATCH(url, data, callback) {
  fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then((response) => {
    if (response.ok && callback) callback();
  });
}

function GET(url, callback) {
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      if (callback) callback(data);
    });
}

// Function to call the shutdown API
function shutdown(callback) {
  const shutdownUrl = `${server}:${port}/shutdown`;
  POST(shutdownUrl, null, callback);
}

// Exporting functions using CommonJS syntax
module.exports = {
  devices,
  attributes,
  project,
  projectClose,
  projectOpen,
  projectSave,
  setPort,
  peripheralPath,
  deviceInfo,
  Elem,
  api,
  POST,
  DELETE,
  PATCH,
  GET,
  shutdown,
};
