const { dialog } = require('electron');
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
  let filename = dialog.showSaveDialogSync(parent, {
    properties: ['showOverwriteConfirmation'],
    title: 'Save project file...',
    filters: [{ name: 'Project file (*.rpe)', extensions: ['rpe'] }],
    defaultPath: 'project.rpe',
  });
  if (filename !== undefined) {
    if (path.extname(filename) !== '.rpe') filename += '.rpe';
  }
  return filename === undefined ? '' : filename;
}

module.exports = {
  openProjectRequest,
  saveProjectRequest,
};
