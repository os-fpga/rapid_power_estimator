const {
  app, BrowserWindow, Menu, ipcMain,
} = require('electron');
const { spawn } = require('child_process');
const path = require('node:path');
const fs = require('fs');
const Store = require('electron-store');
const config = require('./rpe.config.json');

const schema = {
  port: {
    type: 'number',
    maximum: 65535,
    minimum: 1,
    default: config.port,
  },
  device_xml: {
    type: 'string',
    default: config.device_xml,
  },
};

const store = new Store({ schema });

let mainWindow = null;

const isDev = process.argv.find((val) => val === '--development');
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
  if (fs.existsSync(RestAPIscript)) {
    apiServer = spawn('python', [RestAPIscript, path.join(__dirname, deviceXml), ...args]);
  } else {
    apiServer = spawn(restAPIexe, [path.join(app.getAppPath(), '..', '..', deviceXml), ...args]);
  }

  apiServer.stdout.on('data', (data) => {
    console.log(`stdout:\n${data}`);
  });

  apiServer.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
  });

  apiServer.on('error', (error) => {
    console.log(`error: ${error.message}`);
  });

  apiServer.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
  });

  apiServer.on('message', (message) => {
    console.log(`message:\n${message}`);
  });

  return apiServer;
};

let child = null;
const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1100,
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

  ipcMain.on('config', (event, arg) => {
    store.set('port', arg.port);
    store.set('device_xml', arg.device_xml);

    child.kill();
    child = startFlaskServer();
    mainWindow.reload();
  });
};

app.whenReady().then(() => {
  child = startFlaskServer();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  child.kill('SIGINT');
  if (process.platform !== 'darwin') app.quit();
});
