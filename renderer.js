// window.addEventListener('keydown', (event) => {
//     console.log(event.key);
// }, true);

const { ipcRenderer, session } = require('electron');

let titleElement = document.getElementById('filename');
let editorElement = document.getElementById('editor');

function getNameFromPath(filepath) {
    // let filename = ipcRenderer.sendSync('get-filename', filepath);
    // return filename;
    // Dont do this, it blocks render and slows things down
}

ipcRenderer.on('file:saved', (event, filename, filepath) => {
    setFileName(filename, filepath);
});

ipcRenderer.on('file:open', (event, filename, filepath, content) => {
    setFileName(filename, filepath);
    setTextContent(content);
});

function setFileName(filename, filepath) {
    let formatTitle = (filename) => `${filename} - Notepad`;

    if (!filename) {
        sessionStorage.setItem('filename', formatTitle('Untitled'));
    } else {
        console.log("Filename:", getNameFromPath(filepath));
        
        sessionStorage.setItem('filename', formatTitle(filename));
        sessionStorage.setItem('filepath', filepath);
    }

    titleElement.textContent = sessionStorage.getItem('filename');
}

function setTextContent(content) {
    editorElement.textContent = content;
}

document.addEventListener('DOMContentLoaded', (event) => {
    setFileName();
});

editorElement.addEventListener('input', (event) => {
    const title = titleElement.textContent;

    if (!editorElement.value) {
        if (title.startsWith('*')) 
            titleElement.textContent = title.split('*')[1];
    } else {
        if (!title.startsWith('*'))
            titleElement.textContent = `*${title}`;
    }
});