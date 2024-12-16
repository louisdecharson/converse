// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    beautify: (text) => ipcRenderer.invoke('beautify', text),
    viewSettings: (callback) =>
        ipcRenderer.on(
            'settings:view',
            (_event, settings, showWelcomeMessage) =>
                callback(settings, showWelcomeMessage)
        ),
    viewLicense: (callback) =>
        ipcRenderer.on(
            'license:view',
            (_event, currentLicense, showLicenseScreen) =>
                callback(currentLicense, showLicenseScreen)
        ),
    setSettings: (settings) => ipcRenderer.send('settings:set', settings),
    viewHistory: (callback) =>
        ipcRenderer.on('history:send', (_event, chatHistory, toggle) =>
            callback(chatHistory, toggle)
        ),
    viewMoreHistory: (nbItems) =>
        ipcRenderer.invoke('history:view-more', nbItems)
});
