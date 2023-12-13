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
    setSettings: (settings) => ipcRenderer.send('settings:set', settings)
});
