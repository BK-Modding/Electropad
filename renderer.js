const { ipcRenderer, session } = require('electron');

let titleElement = document.getElementById('filename');
let editorElement = document.getElementById('editor');

const setModified = (value) => {
    sessionStorage.setItem("modified", value);
}

function setFile(filepath) {
    let formatTitle = (filename) => `${filename} - Notepad`;

    if (!filepath) {
        titleElement.textContent = formatTitle('Untitled');
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
});

editorElement.addEventListener('input', (event) => {
    const title = titleElement.textContent;

    if (!editorElement.value) {
        if (title.startsWith('*')) 
            titleElement.textContent = title.split('*')[1];
        setModified(false);
    } else {
        if (!title.startsWith('*'))
            titleElement.textContent = `*${title}`;
        setModified(true);
    }
});

ipcRenderer.on('file:saved', (event, filepath) => {
    setFile(filepath);
});

ipcRenderer.on('file:open', (event, filepath, content) => {
    setFile(filepath);
    editorElement.textContent = content;
});