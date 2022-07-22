const { Menu } = require('electron');

const { createWindow } = require('./operations');

const generateMainMenu = (windows) => {
    const mainMenuTemplate = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'New',
                    accelerator: 'CommandOrControl+N',
                },
                {
                    label: 'New Window',
                    accelerator: 'CommandOrControl+Shift+N',
                    click() {
                        createWindow(windows, true);
                    }
                },
                { type: 'separator' },
                {
                    role: 'close'
                }
            ]
        }
    ]

    return Menu.buildFromTemplate(mainMenuTemplate);
}

module.exports = {
    generateMainMenu
}
