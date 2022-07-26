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

const getFilePath = (currentWindow) => {
    currentWindow.webContents.executeJavaScript('savedEditorContents', true).then(content => {
        console.log("content", content);
    });
    
    return currentWindow.webContents.executeJavaScript('sessionStorage.getItem("filepath")', true).then(filepath => {
        return filepath;
    });
}

const getEditorContent = (currentWindow) => {
    return currentWindow.webContents.executeJavaScript('document.getElementById("editor").value', true).then(content => {
        return content;
    });
}

const getModified = (currentWindow) => {
    return currentWindow.webContents.executeJavaScript('sessionStorage.getItem("modified")', true).then(modified => {
        return modified === 'true';
    });
}

const saveChangesPrompt = (currentWindow) => {
    return getFilePath(currentWindow).then(filepath => {
        let title = filepath ?? 'Untitled';

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
        });
    });
}

const saveChangesHandler = (currentWindow) => {
    return getModified(currentWindow).then(modified => {
        if (!modified) {
            return true;
        } else {
            return saveChangesPrompt(currentWindow).then(result => {
                if (result === "saved" || result === "don't save") {
                    return true;
                }
            });
        }
    });
}

const newHandler = (currentWindow) => {
    return saveChangesHandler(currentWindow).then(status => {
        if (status) {
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
    });
}

const openFileHandler = (currentWindow) => {
    return saveChangesHandler(currentWindow).then(status => {
        if (status) {
            return getFilePath(currentWindow).then(filepath => {
                // return filepath ? openFileDialog(currentWindow, filepath) : openFileDialog(currentWindow);
                if (filepath) {
                    return openFileDialog(currentWindow, filepath);
                } else {
                    return openFileDialog(currentWindow);
                }
            });
        }
    }); 
}

const saveFile = (currentWindow, savedPath) => {
    return getEditorContent(currentWindow).then(content => {
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
    });
}

const saveFileHandler = (currentWindow, saveAsFlag) => {
    return getFilePath(currentWindow).then(filepath => {
        if (filepath) { // file loaded
            if (saveAsFlag) {
                return saveAsDialog(currentWindow, filepath);
            } else {
                return getModified(currentWindow).then(modified => {
                    if (modified) {
                        return saveFile(currentWindow, filepath);
                    }
                });
            }
        } else {
            return saveAsDialog(currentWindow);
        }
    });
}

const closeFileHandler = (currentWindow) => {
    return saveChangesHandler(currentWindow).then(status => {
        if (status)
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