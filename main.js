const { app, BrowserWindow } = require("electron");
const { spawn } = require("child_process");
const path = require("node:path");

const startFlaskServer = () => {
  const device_xml = path.join(__dirname, "backend/etc/device.xml");
  const apiServer = spawn(`python`, [
    path.join(__dirname, "backend/restapi_server.py"),
    device_xml,
  ]);

  apiServer.stdout.on("data", (data) => {
    console.log(`stdout:\n${data}`);
  });

  apiServer.stderr.on("data", (data) => {
    console.log(`stderr: ${data}`);
  });

  apiServer.on("error", (error) => {
    console.log(`error: ${error.message}`);
  });

  apiServer.on("close", (code) => {
    console.log(`child process exited with code ${code}`);
  });

  apiServer.on("message", (message) => {
    console.log(`message:\n${message}`);
  });

  return apiServer;
};

const createWindow = () => {
  const win = new BrowserWindow({ width: 800, height: 600 });
  win.loadFile("dist/index.html");
};

let child = null;

app.whenReady().then(() => {
  child = startFlaskServer();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  child.kill("SIGINT");
  if (process.platform !== "darwin") app.quit();
});
