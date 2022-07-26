const { ipcRenderer, session } = require('electron');

let titleElement = document.getElementById('filename');
let editorElement = document.getElementById('editor');

let savedEditorContents;
let modified;
let fileinfo;

function fileInfoObject(filename, filepath, modified) {
    this.filename = filename ? filename : 'Untitled';
    this.filepath = filepath;
    this.modified = modified ? modified : false;

    this.title = () => `${this.filename} - Notepad`

    // this.formatFilename = (filename) => `${filename} - Notepad`;

    this.getFilename = () => this.filename

    this.setFilename = (filepath) => {
        return ipcRenderer.invoke('file:name', filepath).then(filename => {
            this.filename = fileName;
            titleElement.textContent = formatTitle(filename);
            sessionStorage.setItem('filepath', filepath);
        });
    }

    this.getFilepath = () => this.filepath

    this.setFilepath = (filepath) => {
        this.filepath = filepath;
    }

    this.getModified = () => this.modified

    this.setModified = (state) => {
        this.modified = state;
    }
}

const formatTitle = (filename) => `${filename} - Notepad`;

const setModified = (value) => {
    sessionStorage.setItem("modified", value);
}

const setEditorContents = (content) => {
    editorElement.value = content;
    savedEditorContents = content;
}

function loadFile(fileinfo) {
    if (!fileinfo) {
        fileinfo = new fileInfoObject()
    }
}

function setFile(filepath) {
    if (!filepath) {
        titleElement.textContent = formatTitle('Untitled');
        if (sessionStorage.getItem('filepath'))
            sessionStorage.removeItem('filepath');
    } else {
        ipcRenderer.invoke('file:name', filepath).then(filename => {
            titleElement.textContent = formatTitle(filename);
            sessionStorage.setItem('filepath', filepath);
        });
    }

    setModified(false);
}

document.addEventListener('DOMContentLoaded', (event) => {
    setFile();
    setEditorContents("");
});

editorElement.addEventListener('input', (event) => {
    const title = titleElement.textContent;

    if (editorElement.value === savedEditorContents) {
        if (title.startsWith('*')) 
            titleElement.textContent = title.split('*')[1];
        setModified(false);
    } else {
        if (!title.startsWith('*'))
            titleElement.textContent = `*${title}`;
        setModified(true);
    }
});

ipcRenderer.on('file:new', (event) => {
    setFile();
    setEditorContents("");
});

ipcRenderer.on('file:saved', (event, filepath) => {
    setFile(filepath);
    setEditorContents(editorElement.value);
});

ipcRenderer.on('file:open', (event, filepath, content) => {
    setFile(filepath);
    setEditorContents(content);
});