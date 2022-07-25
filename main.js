const path = require('path');

const { app, globalShortcut } = require('electron');

const { createWindow } = require('./modules/browser');
require('./modules/ipcBackend');

// SET ENV
process.env.NODE_ENV = 'development';

const windows = new Set();

app.on('ready', () => {
    createWindow(windows, false);
    createWindow(windows, true);

    // const exit = globalShortcut.register('CommandOrControl+W', () => {
        
    // });

    // if (!exit)
    //     console.log("Registration failed");

});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});