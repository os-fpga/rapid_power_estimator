const { app, BrowserWindow, Menu } = require('electron');
const { spawn } = require('child_process');
const path = require('node:path');
const fs = require('fs');
const config = require('./rpe.config.json');

const isDev = process.env.NODE_ENV === 'development';
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
      { label: 'Preferences' },
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

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

const startFlaskServer = () => {
  console.log(isDev);
  let apiServer;
  const RestAPIscript = path.join(__dirname, 'backend/restapi_server.py');
  const restAPIexe = path.join(app.getAppPath(), '..', '..', 'backend', 'restapi_server.exe');

  const args = [
    '--port', config.port,
  ];
  if (config.debug === 1) { args.push('--debug'); }

  if (fs.existsSync(RestAPIscript)) {
    apiServer = spawn('python', [RestAPIscript, path.join(__dirname, config.device_xml), ...args]);
  } else {
    apiServer = spawn(restAPIexe, [path.join(app.getAppPath(), '..', '..', config.device_xml), ...args]);
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

const createWindow = () => {
  const win = new BrowserWindow({ width: 1100, height: 700 });
  const indexPath = path.join(app.getAppPath(), 'build/index.html');
  win.loadURL(`file://${indexPath}`);
};

let child = null;

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
