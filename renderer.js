const { ipcRenderer } = require('electron');

let titleElement = document.getElementById('filename');
let editorElement = document.getElementById('editor');

let fileInfo = null;
let backendFilters = ['editorContents'];

function getFilename (filepath) {
    if (!filepath) {
        return new Promise((resolve, reject) => { // Returning immediately resolved promise to standardize this function's interface
            resolve('Untitled');
        });
    } else {
        return ipcRenderer.invoke('file:name', filepath).then(filename => {
            return filename;
        });
    }
}

function fileInfoObject(filepath, editorContents) {
    if (filepath) {
        this.filepath = filepath;
        this.untitled = false;
    } else {
        this.untitled = true;
    }

    this.editorContents = editorContents ? editorContents : '';

    this.getEditorContents = () => this.editorContents;

    this.getProperties = () => {
        return Object.keys(this)
        .filter(key => typeof this[key] !== 'function') // don't send method properties as they can't be serialized
        .filter(key => !backendFilters.includes(key)) // don't send certain properties to backend due to size/security reasons
        .map(key => [key, this[key]]);
    }

    this.isModified = () => editorElement.value !== this.editorContents;
}

function updateUI() {
    editorElement.value = fileInfo.getEditorContents();

    getFilename(fileInfo.filepath).then(filename => {
        titleElement.textContent = `${filename} - Notepad`;
    });
}

function loadFile(filedata) {
    if (fileInfo)
        fileInfo = null;

    if (!filedata) {
        fileInfo = new fileInfoObject();
    } else {
        fileInfo = new fileInfoObject(filedata.filepath, filedata.content);
    }
    updateUI();
}

document.addEventListener('DOMContentLoaded', (event) => {
    loadFile({});
});

editorElement.addEventListener('input', (event) => {
    if (fileInfo) {
        if (fileInfo.isModified()) {
            if (!titleElement.textContent.startsWith('*'))
                titleElement.textContent = `*${titleElement.textContent}`;
        } else {
            if (titleElement.textContent.startsWith('*')) 
                titleElement.textContent = titleElement.textContent.split('*')[1];
        }
    }
});

ipcRenderer.on('file:new', (event) => {
    loadFile({});
});

ipcRenderer.on('file:saved', (event, filepath) => {
    loadFile({
        filepath,
        content: editorElement.value
    });
});

ipcRenderer.on('file:open', (event, filepath, content) => {
    loadFile({
        filepath,
        content
    });
});