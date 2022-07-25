const fs = require('fs');

const { ipcMain } = require('electron');

ipcMain.on('get-filename', (event, args) => {
	console.log("Args coming", args);

    event.returnValue = 'nameo';
});