const {
    app,
    BrowserWindow,
    Menu,
    ipcMain,
    dialog,
    globalShortcut
} = require('electron');
const path = require('node:path');
const express = require('express');
const hbs = require('hbs');
const sqlite3 = require('sqlite3');
const { HistoryTable, TasksTable } = require('./db.js');
const { menu } = require('./menu.js');
const Store = require('electron-store');
const Router = require('./router.js');
const ipc = require('./ipc.js');
const startServer = require('./server.js');

const store = new Store();
const llmRouter = new Router(store);

let mainWindow;
let settingsWindow;

const url = 'http://localhost';
let port;

// Database
const dbPath = path.join(app.getPath('userData'), 'craft.db');
console.log('dbPath:', dbPath);
const database = new sqlite3.Database(dbPath);
const chatHistory = new HistoryTable(database); // store chat history
const tasksTable = new TasksTable(database); // store user configuration

// create windows
const createMainWindow = () => {
    if (!mainWindow) {
        mainWindow = new BrowserWindow({
            width: 850,
            height: 600,
            webPreferences: {
                preload: path.join(__dirname, 'preload.js')
            }
        });
        mainWindow.on('closed', () => {
            mainWindow = null;
        });
    } else {
        mainWindow.focus();
    }
};
const closeCreateTask = () => {
    mainWindow.loadURL(`${url}:${port}`);
};
const createSettingsWindow = () => {
    if (!settingsWindow) {
        settingsWindow = new BrowserWindow({
            width: 850,
            height: 300,
            webPreferences: {
                preload: path.join(__dirname, 'preload_settings.js')
            }
        });
        settingsWindow.loadURL(`${url}:${port}/settings`);
        settingsWindow.webContents.on('did-finish-load', () => {
            settingsWindow.webContents.send('settings:view', {
                openaiAPIKey: store.get('settings:openai-api-key'),
                mistralAPIKey: store.get('settings:mistral-api-key'),
                anthropicAPIKey: store.get('settings:anthropic-api-key')
            });
        });
        settingsWindow.on('closed', () => {
            settingsWindow = null;
        });
    } else {
        settingsWindow.focus();
    }
};
const closeSettingsWindow = () => {
    if (settingsWindow) {
        settingsWindow.close();
    }
};
app.on('ready', () => {
    createMainWindow();
    startServer(tasksTable, (serverPort) => {
        port = serverPort;
        mainWindow.loadURL(`${url}:${port}`);
        console.log(`Loading ${url}:${port}`);
    });
    const appMenu = Menu.buildFromTemplate(
        menu(app.name, createSettingsWindow, () => {
            mainWindow.webContents.send('history:view');
        })
    );
    Menu.setApplicationMenu(appMenu);
    mainWindow.on('ready-to-show', function () {
        mainWindow.show();
        mainWindow.focus();
    });
    globalShortcut.register('CommandOrControl+,', () => {
        createSettingsWindow();
    });
});
app.whenReady().then(() => {
    ipc(
        chatHistory,
        tasksTable,
        llmRouter,
        store,
        closeSettingsWindow,
        closeCreateTask
    ); // setup IPC communication
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow();
        mainWindow.loadURL(`${url}:${port}`);
    }
});
