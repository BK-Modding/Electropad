const path = require('path');

const { BrowserWindow, dialog } = require('electron');

const { closeFileHandler } = require('./operations');

const createWindow = (windows, menuOption) => {
    let newWindow = new BrowserWindow({
        width: 1025,
        height: 525,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            preload: path.resolve(__dirname, 'preload.js')
        }
    });

    newWindow.loadURL(path.resolve(path.resolve(__dirname, '..'), 'window.html'));

    newWindow.on('close', (event) => {
        event.preventDefault();
        closeFileHandler(newWindow);
    });

    newWindow.on('closed', () => {
        windows.delete(newWindow);
        newWindow = null;
    });

    if (menuOption) {
        newWindow.setMenu(generateMainMenu(windows));
    }

    // newWindow.webContents.on('before-input-event', (event, input) => {
    //     if (input.control && input.key.toLowerCase() === 'w') {
    //         console.log('Pressed Control+W');
    //     }
    // });

    windows.add(newWindow);
    return newWindow;
}

module.exports = {
    createWindow
}

const { generateMainMenu } = require('./menu'); // circular dependency pattern needs import of codependency after export declaration