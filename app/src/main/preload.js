// See the Electron documentation for details on how to use preload scripts:
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    chat: ({ messages, provider, model, promptInstructions, taskId, chatId }) =>
        ipcRenderer.invoke('chat', {
            messages,
            provider,
            model,
            promptInstructions,
            taskId,
            chatId
        }),
    getModels: () => ipcRenderer.invoke('models:get'),
    getAllModels: () => ipcRenderer.invoke('models:get-all'),
    refreshModels: () => ipcRenderer.invoke('models:refresh'),
    favModel: (modelId) => ipcRenderer.send('models:set-favorite', modelId),
    unfavModel: (modelId) => ipcRenderer.send('models:unset-favorite', modelId),
    viewHistory: (callback) =>
        ipcRenderer.on('history:view', (event) => {
            callback();
        }),
    viewMoreHistory: (nbItems, taskId) =>
        ipcRenderer.invoke('history:view-more', nbItems, taskId),
    getAllHistory: () => ipcRenderer.invoke('history:get-all'),
    closeCurrentWindow: () => ipcRenderer.send('current-window:close'),
    pinTask: (taskId) => ipcRenderer.send('pintask', taskId),
    unpinTask: (taskId) => ipcRenderer.send('unpintask', taskId)
});
