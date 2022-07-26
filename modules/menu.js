const path = require('path');
const fs = require('fs');

const { Menu, dialog } = require('electron');

const { createWindow } = require('./browser');
const { newHandler, openFileHandler, saveFileHandler } = require('./operations');

const generateMainMenu = (windows) => {
    const mainMenuTemplate = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'New',
                    accelerator: 'CommandOrControl+N',
                    click(menuItem, currentWindow) {
                        newHandler(currentWindow);
                    }
                },
                {
                    label: 'New Window',
                    accelerator: 'CommandOrControl+Shift+N',
                    click() {
                        createWindow(windows, true);
                    }
                },
                {
                    label: 'Open...',
                    accelerator: 'CommandOrControl+O',
                    click(menuItem, currentWindow) {
                        openFileHandler(currentWindow);
                    }
                },
                {
                    label: 'Save',
                    accelerator: 'CommandOrControl+S',
                    click(menuItem, currentWindow) {
                        saveFileHandler(currentWindow, false);
                    }
                },
                {
                    label: 'Save As...',
                    accelerator: 'CommandOrControl+Shift+S',
                    click(menuItem, currentWindow) {
                        saveFileHandler(currentWindow, true);
                    }
                },
                { type: 'separator' },
                {
                    label: 'Exit',
                    role: 'close'
                }
            ]
        }
    ]

    // If mac, add empty object to menu
    if (process.platform === 'darwin') {
        mainMenuTemplate.unshift({});
    }

    // Add developer tools item if not in prod
    if (process.env.NODE_ENV !== 'production') {
        mainMenuTemplate.push({
            label: 'Developer Tools',
            submenu: [
                {
                    role: 'toggleDevTools'
                },
                {
                    role: 'reload'
                }
            ]
        });
    }

    return Menu.buildFromTemplate(mainMenuTemplate);
}

module.exports = {
    generateMainMenu
}
