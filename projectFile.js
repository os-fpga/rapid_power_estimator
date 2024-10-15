const { dialog, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');

function openProjectRequest(parent) {
  const result = dialog.showOpenDialogSync(parent, {
    properties: ['openFile'],
    title: 'Open project file...',
    filters: [{ name: 'Project file (*.rpe)', extensions: ['rpe'] }],
  });
  if (result !== undefined) {
    return result[0];
  }
  return '';
}

function saveProjectRequest(parent) {
  const folderPath = dialog.showSaveDialogSync(parent, {
    title: 'Save project folder...',
    defaultPath: 'project',
    buttonLabel: 'Save Project Folder',
    properties: ['createDirectory'],
  });

  if (folderPath) {
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const folderName = path.basename(folderPath);
    const projectFileName = `${folderName}.rpe`;
    const projectFilePath = path.join(folderPath, projectFileName);
    fs.writeFileSync(projectFilePath, '');

    const currentWindow = BrowserWindow.getFocusedWindow();
    if (currentWindow) {
      currentWindow.setTitle(`${projectFileName} - Rapid Power Estimator`);
    } else {
      console.error('No focused window found to set title.');
    }

    return projectFilePath;
  }

  return '';
}

module.exports = {
  openProjectRequest,
  saveProjectRequest,
};
