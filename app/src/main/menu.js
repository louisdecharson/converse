const menu = (
    appName,
    getSettings,
    viewModels,
    showFullHistory,
    createWindow,
    closeCurrentWindow
) => [
    {
        label: appName,
        submenu: [
            { role: 'about' },
            { type: 'separator' },
            {
                label: 'Settings...',
                accelerator: 'Cmd+,',
                click: () => getSettings(false)
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
    // { role: 'File' }
    {
        label: 'File',
        submenu: [
            {
                label: 'New Window',
                accelerator: 'Command+N',
                click: () => {
                    createWindow();
                }
            },
            {
                label: 'Close Window',
                accelerator: 'Command+W',
                click: () => {
                    closeCurrentWindow();
                }
            },
            { type: 'separator' },
            {
                label: 'Show Full History',
                accelerator: 'Cmd+Y',
                click: () => showFullHistory()
            },
            { type: 'separator' },
            {
                label: 'Models',
                accelerator: 'Cmd+M',
                click: () => viewModels()
            }
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
                submenu: [{ role: 'startSpeaking' }, { role: 'stopSpeaking' }]
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
module.exports = {
    menu: menu
};
