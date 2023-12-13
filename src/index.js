const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron/main');
const path = require('node:path');
const chat = require('./chat.js');
const Store = require('electron-store');

const { promptInstructions, openAIGPTModel } = require('./config.js');

const store = new Store();

// Set defaults
if (store.get('settings:gpt-model') === undefined) {
    store.set('settings:gpt-model', openAIGPTModel);
}
if (store.get('settings:prompt-instructions') === undefined) {
    store.set('settings:prompt-instructions', promptInstructions);
}

const getSettings = () => {
    let currentSettings = {
        apiKey: store.get('settings:openai-api-key'),
        promptInstructions: store.get('settings:prompt-instructions'),
        gptModel: store.get('settings:gpt-model')
    };
    return currentSettings;
};

const createWindow = () => {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });

    // check if we have an API key
    if (store.get('settings:openai-api-key') === undefined) {
        mainWindow.webContents.send('get-api-key', 'no api key');
        console.log('Requesting API key message');
    }

    const template = [
        // { role: 'appMenu' }
        {
            label: app.name,
            submenu: [
                { role: 'about' },
                { type: 'separator' },
                {
                    label: 'Settings...',
                    accelerator: 'Cmd+,',
                    click: () =>
                        mainWindow.webContents.send(
                            'settings:view',
                            getSettings()
                        )
                },
                { type: 'separator' },
                { role: 'services' },
                { type: 'separator' },
                { role: 'hide' },
                { role: 'hideOthers' },
                { role: 'unhide' },
                { type: 'separator' },
                { role: 'quit' }
            ]
        },
        // { role: 'editMenu' }
        {
            label: 'Edit',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' },
                { role: 'pasteAndMatchStyle' },
                { role: 'delete' },
                { role: 'selectAll' },
                { type: 'separator' },
                {
                    label: 'Speech',
                    submenu: [
                        { role: 'startSpeaking' },
                        { role: 'stopSpeaking' }
                    ]
                }
            ]
        },
        // { role: 'viewMenu' }
        {
            label: 'View',
            submenu: [
                { role: 'reload' },
                { role: 'forceReload' },
                { role: 'toggleDevTools' },
                { type: 'separator' },
                { role: 'resetZoom' },
                { role: 'zoomIn' },
                { role: 'zoomOut' },
                { type: 'separator' },
                { role: 'togglefullscreen' }
            ]
        },
        // { role: 'windowMenu' }
        {
            label: 'Window',
            submenu: [
                { role: 'minimize' },
                { role: 'zoom' },
                { type: 'separator' },
                { role: 'front' },
                { type: 'separator' },
                { role: 'window' }
            ]
        },
        {
            role: 'help'
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    // Settings interactions
    ipcMain.on('settings:set', (event, settings) => {
        store.set('settings:openai-api-key', settings['apiKey']);
        store.set(
            'settings:prompt-instructions',
            settings['promptInstructions']
        );
        store.set('settings:gpt-model', settings['gptModel']);
    });

    // and load the index.html of the app.
    mainWindow.loadFile(path.join(__dirname, 'index.html'));

    // Open the DevTools.
    // mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    ipcMain.handle('beautify', async (event, text) => {
        const beautifiedText = await chat.craftEmail(
            store.get('settings:openai-api-key'),
            store.get('settings:prompt-instructions'),
            store.get('settings:gpt-model'),
            text
        );
        console.log('Text beautified');
        return beautifiedText;
    });
    ipcMain.handle('set-api-key', async (event, apiKey) => {
        store.set('settings:openai-api-key', apiKey);
        return 'apikey set';
    });
    createWindow();
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
        createWindow();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
