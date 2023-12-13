// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    beautify: (text) => ipcRenderer.invoke('beautify', text),
    setApiKey: (key) => ipcRenderer.invoke('set-api-key', key),
    getApiKey: (callback) =>
        ipcRenderer.on('get-api-key', (_event, value) => callback(value)),
    viewSettings: (callback) =>
        ipcRenderer.on('settings:view', (_event, settings) =>
            callback(settings)
        ),
    setSettings: (settings) => ipcRenderer.send('settings:set', settings)
});
