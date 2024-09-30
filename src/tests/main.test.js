const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const { createWindow, startFlaskServer } = require('../../main'); 

jest.mock('electron', () => ({
  app: {
    whenReady: jest.fn().mockResolvedValue(),
    on: jest.fn(),
    quit: jest.fn(),
    relaunch: jest.fn(),
    getPath: jest.fn().mockReturnValue('/mocked/path'),
    getVersion: jest.fn().mockReturnValue('1.0.0'),
    getAppPath: jest.fn().mockReturnValue('/mocked/app/path'),
  },
  BrowserWindow: jest.fn().mockImplementation(() => ({
    loadURL: jest.fn(),
    webContents: {
      send: jest.fn(),
      on: jest.fn(),
    },
    setTitle: jest.fn(),
    on: jest.fn(),
  })),
  ipcMain: {
    on: jest.fn((event, callback) => {
      if (event === 'projectData') {
        callback({}, { messages: [] });
      }
      if (event === 'config') {
        callback({}, { port: 8080, device_xml: 'path', useDefaultFile: true });
      }
    }),
  },
  dialog: {
    showMessageBoxSync: jest.fn(),
  },
  Menu: {
    buildFromTemplate: jest.fn().mockReturnValue({}),
    setApplicationMenu: jest.fn(),
  },
}));

jest.mock('../../main', () => ({
  createWindow: jest.fn(),
  startFlaskServer: jest.fn().mockReturnValue({}),
}));

describe('Electron Main Process', () => {
  let mockWindow;

  beforeEach(() => {
    jest.clearAllMocks();
    mockWindow = new BrowserWindow();
  });

  test('should create a BrowserWindow on app ready', async () => {
    await app.whenReady();
    createWindow();
    expect(BrowserWindow).toHaveBeenCalled();
    expect(mockWindow).toBeDefined();
  });

  test('should start Flask server on app ready', async () => {
    await app.whenReady();
    const serverProcess = startFlaskServer();
    expect(serverProcess).toBeDefined();
  });

  test('should quit the app when all windows are closed (non-darwin)', () => {
    app.on.mockImplementationOnce((event, callback) => {
      if (event === 'window-all-closed') {
        callback();
      }
    });
    app.quit();
    expect(app.quit).toHaveBeenCalled();
  });

  test('should send project data when ipcMain receives projectData', () => {
    createWindow();
    const mockArg = { messages: [] };
    ipcMain.on('projectData', (_, data) => {
      mockWindow.webContents.send('projectData', data);
    });
    expect(mockWindow.webContents.send).toHaveBeenCalledWith('projectData', mockArg);
  });

  test('should set config when ipcMain receives config event', () => {
    createWindow();
    const mockConfig = { port: 8080, device_xml: 'path', useDefaultFile: true };
    ipcMain.on('config', (_, config) => {
      mockWindow.webContents.send('loadConfig', config);
    });
    expect(mockWindow.webContents.send).toHaveBeenCalledWith('loadConfig', mockConfig);
  });

  test('should handle app relaunch event', () => {
    app.on.mockImplementationOnce((event, callback) => {
      if (event === 'relaunch') {
        callback();
      }
    });
    app.relaunch();
    expect(app.relaunch).toHaveBeenCalled();
  });
});
