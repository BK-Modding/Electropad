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

const getFileInfo = (currentWindow) => {
    return currentWindow.webContents.executeJavaScript('fileInfo.getProperties()', true).then(fileInfoList => {
        return Object.fromEntries(fileInfoList);
    })
}

const getEditorContents = (currentWindow) => {
    return currentWindow.webContents.executeJavaScript('fileInfo.getEditorContents()', true).then(content => {
        return content;
    });
}

const getFileModified = (currentWindow) => {
    return currentWindow.webContents.executeJavaScript('fileInfo.isModified()', true).then(modified => {
        return modified;
    });
}

const saveChangesPrompt = (currentWindow) => {
    return getFileInfo(currentWindow).then((fileInfo) => {
        let title = fileInfo.untitled ? 'Untitled' : fileInfo.filepath;

        return dialog.showMessageBox(currentWindow, {
            type: 'none',
            buttons: ['Save', "Don't Save", 'Cancel'],
            defaultId: 0,
            title: 'Notepad',
            message: `Do you want to save changes to ${title}?`,
            cancelId: 2,
            noLink: true
        }).then(result => {
            if (result.response === 0) {
                return saveFileHandler(currentWindow, false).then(() => {
                    return "saved";
                });
            } else if (result.response === 1) {
                return "don't save";
            } else if (result.response === 2) {
                return "cancel";
            }
        }).catch(err => {
            console.log(err);
            throw err;
        });
    });
}

const saveChangesHandler = (currentWindow) => {
    return getFileModified(currentWindow).then(modified => {
        if (!modified) {
            return "not modified";
        } else {
            return saveChangesPrompt(currentWindow);
        }
    });
}

const newHandler = (currentWindow) => {
    return saveChangesHandler(currentWindow).then(status => {
        if (["not modified", "saved", "don't save"].includes(status)) {
            console.log("New!");
            currentWindow.webContents.send('file:new');

            return "New!";
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
        throw err;
    });
}

const openFileHandler = (currentWindow) => {
    return saveChangesHandler(currentWindow).then(status => {
        if (["not modified", "saved", "don't save"].includes(status)) {
            return getFileInfo(currentWindow).then(fileInfo => {
                // return filepath ? openFileDialog(currentWindow, filepath) : openFileDialog(currentWindow);
                if (!fileInfo.untitled) {
                    return openFileDialog(currentWindow, fileInfo.filepath);
                } else {
                    return openFileDialog(currentWindow);
                }
            });
        }
    }); 
}

const saveFile = (currentWindow, savedPath) => {
    return getEditorContents(currentWindow).then(content => {
        return new Promise((resolve, reject) => {
            fs.writeFile(savedPath, content, (err) => {
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
        throw err;
    });
}

const saveFileHandler = (currentWindow, saveAsFlag) => {
    return getFileInfo(currentWindow).then(fileInfo => {
        console.log(fileInfo);
        if (!fileInfo.untitled) { // file loaded so fileInfo.filepath exists
            if (saveAsFlag) {
                return saveAsDialog(currentWindow, fileInfo.filepath);
            } else {
                return getFileModified(currentWindow).then(modified => {
                    if (modified) {
                        return saveFile(currentWindow, fileInfo.filepath);
                    }
                });
            }
        } else { // file not loaded so no difference between save and save as
            return saveAsDialog(currentWindow);
        }
    });
}

const closeFileHandler = (currentWindow) => {
    return saveChangesHandler(currentWindow).then(status => {
        if (["not modified", "saved", "don't save"].includes(status))
            newWindow.destroy();
    });
}

module.exports = {
    nameFromPath,
    newHandler,
    openFileHandler,
    saveFileHandler,
    closeFileHandler
}