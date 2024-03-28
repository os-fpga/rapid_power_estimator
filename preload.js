const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ipcAPI', {
  loadPreferences: (channel, listener) => ipcRenderer.on(channel, listener),
  send: (channel, data) => ipcRenderer.send(channel, data),
});
