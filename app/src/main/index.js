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
const Router = require('./router.js');
const ipc = require('./ipc.js');
const startServer = require('./server.js');
const Settings = require('./settings.js');
const Models = require('./models.js');
const Store = require('electron-store');

const store = new Store();
const settings = new Settings(store);
const llmRouter = new Router(settings);
const models = new Models(store);

let mainWindow;
let settingsWindow;
const windows = new Set();

const host = 'http://localhost';
let port;

// Database
const dbPath = path.join(app.getPath('userData'), 'converse.db');
console.log('dbPath:', dbPath);
const database = new sqlite3.Database(dbPath);
const chatHistory = new HistoryTable(database); // store chat history
const tasksTable = new TasksTable(database); // store user configuration

// create windows
const createWindow = (url = null) => {
    let x, y;
    const currentWindow = BrowserWindow.getFocusedWindow();

    if (currentWindow) {
        const [currentWindowX, currentWindowY] = currentWindow.getPosition();
        x = currentWindowX + 24;
        y = currentWindowY + 24;
    }
    let newWindow = new BrowserWindow({
        width: 850,
        height: 600,
        x: x,
        y: y,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });
    if (!url) {
        url = `${host}:${port}`;
    }
    newWindow.loadURL(url);
    newWindow.webContents.on('did-finish-load', () => {
        if (!newWindow) {
            throw new Error('"newWindow" is not defined');
        }
        if (process.env.START_MINIMIZED) {
            newWindow.minimize();
        } else {
            newWindow.show();
            newWindow.focus();
        }
    });
    newWindow.on('closed', () => {
        windows.delete(newWindow);
        newWindow = null;
    });
    // newWindow.on('focus', () => {
    //     newWindow.focus();
    // });
    windows.add(newWindow);
    return newWindow;
};
const createMainWindow = () => {
    if (!mainWindow) {
        mainWindow = createWindow();
        mainWindow.loadURL(`${host}:${port}`);
        console.log('creating main window');
        mainWindow.on('closed', () => {
            mainWindow = null;
        });
    } else {
        mainWindow.focus();
    }
};
// create models windows
const createModelsWindow = () => {};
const closeCurrentWindow = () => {
    const currentWindow = BrowserWindow.getFocusedWindow();
    if (currentWindow) {
        currentWindow.close();
    }
};
const createSettingsWindow = (displayWelcomeMessage) => {
    if (!settingsWindow) {
        settingsWindow = new BrowserWindow({
            width: 850,
            height: 400,
            webPreferences: {
                preload: path.join(__dirname, 'preload_settings.js')
            }
        });
        settingsWindow.loadURL(`${host}:${port}/settings`);
        settingsWindow.webContents.on('did-finish-load', () => {
            settingsWindow.webContents.send('settings:view', {
                openaiAPIKey: settings.getApiKey('openai'),
                mistralAPIKey: settings.getApiKey('mistralai'),
                anthropicAPIKey: settings.getApiKey('anthropic'),
                openRouterAPIKey: settings.getApiKey('openrouter'),
                displayWelcomeMessage: displayWelcomeMessage
            });
            settingsWindow.focus();
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
    startServer(chatHistory, tasksTable, (serverPort) => {
        port = serverPort;
        console.log(`Loading ${host}:${port}`);
        createMainWindow();
        if (!settings.hasDefinedApiKeys()) {
            createSettingsWindow(true);
            settingsWindow.on('ready-to-show', function () {
                settingsWindow.show();
                settingsWindow.focus();
            });
        } else {
            mainWindow.on('ready-to-show', function () {
                mainWindow.show();
                mainWindow.focus();
            });
        }
    });
    const appMenu = Menu.buildFromTemplate(
        menu(
            app.name,
            createSettingsWindow,
            () => {
                mainWindow.webContents.send('history:view');
            },
            () => createWindow(`${host}:${port}/models`),
            () => {
                const currentWindow = BrowserWindow.getFocusedWindow();
                currentWindow.loadURL(`${host}:${port}/history`);
            },
            () => createWindow()
        )
    );
    Menu.setApplicationMenu(appMenu);
});
app.whenReady().then(() => {
    ipc(
        chatHistory,
        tasksTable,
        llmRouter,
        settings,
        models,
        closeSettingsWindow,
        closeCurrentWindow
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
        mainWindow.loadURL(`${host}:${port}`);
        if (!settings.hasDefinedApiKeys()) {
            createSettingsWindow(true);
        }
    }
});
