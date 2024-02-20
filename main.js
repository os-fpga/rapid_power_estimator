const { app, BrowserWindow } = require("electron");
const { spawn } = require("child_process");
const path = require("node:path");

const config = require("./rpe.config.json")

const startFlaskServer = () => {

  const device_xml = path.join(__dirname, config.device_xml);
  var args = [
    path.join(__dirname, "backend/restapi_server.py"),
    device_xml, "--port", config.port
  ];
  if (config.debug === 1)
    args.push("--debug");
  const apiServer = spawn(`python`, args);

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
  const win = new BrowserWindow({ width: 1000, height: 600 });
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
