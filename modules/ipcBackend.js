const fs = require('fs');

const { ipcMain } = require('electron');

const { nameFromPath } = require('./operations');

ipcMain.handle('file:name', async (event, filepath) => {
    const filename = nameFromPath(filepath);
    return filename;
});