// IPC Logic
const { ipcMain } = require('electron');

const ipc = (
    chatHistory,
    tasksTable,
    llmRouter,
    settings,
    models,
    closeSettingsWindow,
    closeCurrentWindow
) => {
    ipcMain.handle(
        'chat',
        async (
            event,
            { messages, provider, model, promptInstructions, taskId, chatId }
        ) => {
            const {
                textResponse,
                promptTokens,
                completionTokens,
                totalTokens
            } = await llmRouter.chat(
                provider,
                model,
                promptInstructions,
                messages
            );
            const rowId = await chatHistory.insert(
                'user',
                model,
                provider,
                promptInstructions,
                JSON.stringify(messages),
                textResponse,
                promptTokens,
                completionTokens,
                totalTokens,
                taskId,
                chatId
            );
            return { textResponse, rowId };
        }
    );
    ipcMain.handle('history:view-more', async (event, limit, task_id) => {
        const rows = await asyncWrapper(
            chatHistory,
            'findMany',
            { task_id: task_id },
            'timestamp',
            limit,
            false
        );
        return rows;
    });
    ipcMain.handle('history:get-all', async (event) => {
        const fullHistory = await asyncWrapper(
            chatHistory,
            'getEnrichedHistory',
            tasksTable
        );
        return fullHistory;
    });
    ipcMain.on('settings:set', (event, userSettings) => {
        settings.setApiKey('openai', userSettings['openaiAPIKey']);
        settings.setApiKey('mistralai', userSettings['mistralAPIKey']);
        settings.setApiKey('anthropic', userSettings['anthropicAPIKey']);
        settings.setApiKey('openrouter', userSettings['openRouterAPIKey']);
    });
    ipcMain.on('settings:close', (event) => {
        closeSettingsWindow();
    });
    ipcMain.on('current-window:close', (event) => {
        closeCurrentWindow();
    });
    ipcMain.handle('models:get', async (event) => {
        return models.getDict(undefined, true);
    });
    ipcMain.handle('models:get-all', async (event) => {
        return models.get();
    });
    ipcMain.handle('models:refresh', async (event) => {
        const listModels = await models.refresh(llmRouter);
        return listModels;
    });
    ipcMain.on('models:set-favorite', (event, modelId) => {
        models.setFavorite(modelId);
    });
    ipcMain.on('models:unset-favorite', (event, modelId) => {
        models.unsetFavorite(modelId);
    });
    ipcMain.on('pintask', (event, taskId) => {
        tasksTable.update(taskId, { pinned: true });
    });
    ipcMain.on('unpintask', (event, taskId) => {
        tasksTable.update(taskId, { pinned: false });
    });
};

function asyncWrapper(instance, asyncMethod, ...args) {
    return new Promise((resolve, reject) => {
        instance[asyncMethod](
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            },
            ...args
        );
    });
}
module.exports = ipc;
