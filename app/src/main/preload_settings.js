const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    viewSettings: (callback) => {
        ipcRenderer.on('settings:view', (_event, settings) =>
            callback(settings)
        );
    },
    saveSettings: (settings) => ipcRenderer.send('settings:set', settings),
    closeSettings: () => ipcRenderer.send('settings:close')
});
