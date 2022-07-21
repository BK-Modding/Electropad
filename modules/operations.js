const path = require('path');

const { BrowserWindow } = require('electron');
const { generateMainMenu } = require('./menu');

const createWindow = (windows, menuOption) => {
    let newWindow = new BrowserWindow({
        width: 1025,
        height: 525,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    newWindow.loadURL(path.resolve(path.resolve(__dirname, '..'), 'window.html'));

    newWindow.on('closed', () => {
        windows.delete(newWindow);
        newWindow = null;
    });

    if (menuOption) {
        newWindow.setMenu(generateMainMenu(windows));
    }

    windows.add(newWindow);

    return newWindow;
}

module.exports = {
    createWindow
}