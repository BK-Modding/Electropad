const path = require('path');

const { BrowserWindow, dialog } = require('electron');

const { saveFileHandler, saveChangesPrompt } = require('./operations');

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
        
        saveChangesPrompt(newWindow, () => {
            newWindow.destroy();
        });
        // newWindow.webContents.executeJavaScript('sessionStorage.getItem("modified")', true).then(modified => {
        //     if (modified) {
        //         newWindow.webContents.executeJavaScript('sessionStorage.getItem("filepath")', true).then(filepath => {
        //             let title = filepath ?? 'Untitled';

        //             dialog.showMessageBox(newWindow, {
        //                 type: 'none',
        //                 buttons: ['Save', "Don't Save", 'Cancel'],
        //                 defaultId: 0,
        //                 title: 'Notepad',
        //                 message: `Do you want to save changes to ${title}?`,
        //                 cancelId: 2,
        //                 noLink: true
        //             }).then(result => {
        //                 if (result.response === 0) {
        //                     saveFileHandler(newWindow, false).then(() => {
        //                         newWindow.destroy();
        //                     });
        //                 } else if (result.response === 1) {
        //                     newWindow.destroy();
        //                 }
        //             }).catch(err => {
        //                 console.log(err);
        //             });
        //         });
        //     } else {
        //         newWindow.close();
        //     }
        // });
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