const path = require('path');
const fs = require('fs');

const { dialog } = require('electron');

const nameFromPath = (filepath) => {
    // const nameWithExt = path.basename(filepath);
    // const ext = path.extname(filepath);
    // const filename = path.basename(nameWithExt, ext);
    // return filename;

    return path.basename(filepath, path.extname(filepath))
}

const saveFile = (currentWindow, savedPath) => {
    return currentWindow.webContents.executeJavaScript('document.getElementById("editor").value', true).then(textData => {
        return new Promise((resolve, reject) => {
            fs.writeFile(savedPath, textData, (err) => {
                if (err) reject(err);

                console.log("Saved!");
                currentWindow.webContents.send("file:saved", savedPath);

                resolve("Saved!");
            });
        });
    });
}

const saveAsDialog = (currentWindow, previouslySavedPath) => {
    return dialog.showSaveDialog(currentWindow, {
        title: 'Save As',
        defaultPath: previouslySavedPath ?? path.resolve(process.env.HOMEPATH, '*.txt'),
        buttonLabel: 'Save',
        filters: [
            { name: 'Text Documents (*.txt)', extensions: ['txt'] },
            { name: 'All Files', extensions: ['*'] }
        ]
    }).then(file => {
        if (!file.canceled) {
            return saveFile(currentWindow, file.filePath.toString());
        }
    }).catch(err => {
        console.log(err);
    });
}

const saveFileHandler = (currentWindow, saveAsFlag) => {
    return currentWindow.webContents.executeJavaScript('sessionStorage.getItem("filepath")', true).then(filepath => {
        if (filepath) { // file loaded
            if (saveAsFlag) {
                return saveAsDialog(currentWindow, filepath);
            } else {
                return saveFile(currentWindow, filepath);
            }
        } else {
            return saveAsDialog(currentWindow);
        }
    });
}

const openFile = (currentWindow, openPath) => {
    return new Promise((resolve, reject) => {
        fs.readFile(openPath, 'utf8', (err, content) => {
            if (err) reject(err);

            console.log("Opened!");
            currentWindow.webContents.send('file:open', openPath, content);

            resolve("Opened!");
        });
    });
}

const openFileDialog = (currentWindow, previouslySavedPath) => {
    return dialog.showOpenDialog(currentWindow, {
        title: 'Open',
        defaultPath: previouslySavedPath ?? path.resolve(process.env.HOMEPATH, '*.txt'),
        buttonLabel: 'Open',
        filters: [
            { name: 'Text Documents (*.txt)', extensions: ['txt'] },
            { name: 'All Files', extensions: ['*'] }
        ],
        properties: ['openFile']
    }).then(files => {
        if (!files.canceled) {
            return openFile(currentWindow, files.filePaths[0]);
        }
    }).catch(err => {
        console.log(err);
    });
}

const openFileHandler = (currentWindow) => {
    return currentWindow.webContents.executeJavaScript('sessionStorage.getItem("filepath")', true).then(filepath => {
        if (filepath) {
            return openFileDialog(currentWindow, filepath)
        } else {
            return openFileDialog(currentWindow);
        }
    });
}

const saveChangesPrompt = (currentWindow, callback) => {
    return currentWindow.webContents.executeJavaScript('sessionStorage.getItem("modified")', true).then(modified => {
        if (modified) {
            return currentWindow.webContents.executeJavaScript('sessionStorage.getItem("filepath")', true).then(filepath => {
                let title = filepath ?? 'Untitled';

                return dialog.showMessageBox(newWindow, {
                    type: 'none',
                    buttons: ['Save', "Don't Save", 'Cancel'],
                    defaultId: 0,
                    title: 'Notepad',
                    message: `Do you want to save changes to ${title}?`,
                    cancelId: 2,
                    noLink: true
                }).then(result => {
                    if (result.response === 0) {
                        return saveFileHandler(newWindow, false).then(() => {
                            callback();
                        });
                    } else if (result.response === 1) {
                        callback();
                    }
                }).catch(err => {
                    console.log(err);
                });
            });
        } else {
            callback();
        }
    });
}

module.exports = {
    saveFileHandler,
    openFileHandler,
    nameFromPath,
    saveChangesPrompt
}