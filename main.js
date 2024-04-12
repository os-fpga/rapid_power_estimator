const {
  app, BrowserWindow, Menu, ipcMain,
} = require('electron');
const { spawn } = require('child_process');
const path = require('node:path');
const fs = require('fs');
const Store = require('electron-store');
const log = require('electron-log');
const config = require('./rpe.config.json');

const logFormat = '[{h}:{i}:{s}.{ms}] [{level}] {text}';
log.transports.console.format = logFormat;
log.transports.file.format = logFormat;
log.transports.file.fileName = 'rpe.log';
log.transports.file.maxSize = 1024 * 1024 * 10; // 10MB

const schema = {
  port: {
    type: 'number',
    maximum: 65535,
    minimum: 1,
    default: config.port,
  },
  useDefaultFile: {
    type: 'boolean',
    default: true,
  },
  device_xml: {
    type: 'string',
    default: '',
  },
};

const store = new Store({ schema });

let mainWindow = null;

const isDev = process.argv.find((val) => val === '--development');
if (!isDev) {
  ['log', 'warn', 'error', 'info', 'debug'].forEach((method) => {
    console[method] = log[method].bind(log);
  });
  log.transports.console.level = false; // silent console
}
const template = [
  {
    label: 'File',
    submenu: [
      { label: 'New Project' },
      { label: 'Open Project' },
      { label: 'Close Project' },
      { label: 'Sample Project' },
      { label: 'Save' },
      { label: 'Save as...' },
      { type: 'separator' },
      {
        label: 'Preferences',
        click: async () => {
          mainWindow.webContents.send('preferences', store.store);
        },
      },
      { type: 'separator' },
      { role: 'quit' },
    ],
  },
  {
    label: 'Config',
    submenu: [
      { label: 'Device' },
      { label: 'Defaults' },
      { label: 'Peripherals' },
    ],
  },
  ...(isDev ? [{
    label: 'Debug',
    submenu: [
      { role: 'toggleDevTools' },
      { role: 'forceReload' },
    ],
  }] : []),
  {
    label: 'Help',
    submenu: [
      {
        role: 'help',
        click: async () => {
          const { shell } = require('electron');
          await shell.openExternal('https://github.com/os-fpga/rapid_power_estimator/blob/main/README.md');
        },
      },
    ],
  },
];

const startFlaskServer = () => {
  let apiServer;
  const RestAPIscript = path.join(__dirname, 'backend/restapi_server.py');
  const restAPIexe = path.join(app.getAppPath(), '..', '..', 'backend', 'restapi_server.exe');

  const args = [
    '--port', store.get('port'),
  ];
  if (config.debug === 1) { args.push('--debug'); }

  const deviceXml = store.get('device_xml');
  const useDefaultFile = store.get('useDefaultFile');
  if (fs.existsSync(RestAPIscript)) {
    apiServer = spawn('python', [RestAPIscript, useDefaultFile ? path.join(__dirname, config.device_xml) : deviceXml, ...args]);
  } else {
    apiServer = spawn(restAPIexe, [useDefaultFile ? path.join(app.getAppPath(), '..', '..', config.device_xml) : deviceXml, ...args]);
  }

  apiServer.stdout.on('data', (data) => {
    console.log(`stdout:\n${data}`);
  });

  apiServer.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
  });

  apiServer.on('error', (error) => {
    console.error(`error: ${error.message}`);
  });

  apiServer.on('close', (code) => {
    console.warn(`serverProcess exited with code ${code}`);
  });

  apiServer.on('message', (message) => {
    console.log(`message:\n${message}`);
  });

  return apiServer;
};

let serverProcess = null;
const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 700,
    webPreferences: {
      preload: path.join(app.getAppPath(), 'preload.js'),
      nodeIntegration: true,
      contextIsolation: true,
    },
  });
  const indexPath = path.join(app.getAppPath(), 'build/index.html');
  mainWindow.loadURL(`file://${indexPath}`);

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('loadConfig', store.store);
  });

  ipcMain.on('config', (event, arg) => {
    store.set('port', arg.port);
    store.set('device_xml', arg.device_xml);
    store.set('useDefaultFile', arg.useDefaultFile);

    serverProcess.kill();

    app.relaunch();
    app.quit();
  });
  ipcMain.on('getConfig', (event, arg) => {
    mainWindow.webContents.send('loadConfig', store.store);
  });
};

app.whenReady().then(() => {
  serverProcess = startFlaskServer();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  serverProcess.kill('SIGINT');
  if (process.platform !== 'darwin') app.quit();
});
