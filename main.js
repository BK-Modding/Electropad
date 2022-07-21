const path = require('path');

const { app } = require('electron');

const { createWindow } = require('./modules/operations')

// SET ENV
process.env.NODE_ENV = 'development';

const windows = new Set();

app.on('ready', () => {
    createWindow(windows, false);
    createWindow(windows, true);
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});