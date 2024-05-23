const { dialog } = require('electron');

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
  const result = dialog.showSaveDialogSync(parent, {
    properties: ['showOverwriteConfirmation'],
    title: 'Save project file...',
    filters: [{ name: 'Project file (*.rpe)', extensions: ['rpe'] }],
  });
  return result === undefined ? '' : result;
}

function sendProjectData(projectData) {
  // TODO pending API
}

function fetchProjectData(projectData, callback) {
  // TODO pending API
  callback({ // TODO, replace with real data
    file: projectData.file, lang: '1', name: 'Name', notes: 'some notes', changed: false,
  });
}

module.exports = {
  openProjectRequest,
  saveProjectRequest,
  sendProjectData,
  fetchProjectData,
};
