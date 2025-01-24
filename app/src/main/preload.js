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
    getModels: () => ipcRenderer.invoke('get-models'),
    viewHistory: (callback) =>
        ipcRenderer.on('history:view', (event) => {
            callback();
        }),
    viewMoreHistory: (nbItems, taskId) =>
        ipcRenderer.invoke('history:view-more', nbItems, taskId),
    closeCreateTask: () => ipcRenderer.send('create-task:close'),
    pinTask: (taskId) => ipcRenderer.send('pintask', taskId),
    unpinTask: (taskId) => ipcRenderer.send('unpintask', taskId)
});
