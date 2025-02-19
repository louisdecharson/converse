// IPC Logic
const { ipcMain } = require('electron');
const models = require('./models.js');

const ipc = (
    chatHistory,
    tasksTable,
    llmRouter,
    settings,
    closeSettingsWindow,
    closeCreateTask
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
    ipcMain.on('settings:set', (event, userSettings) => {
        settings.setApiKey('openai', userSettings['openaiAPIKey']);
        settings.setApiKey('mistralai', userSettings['mistralAPIKey']);
        settings.setApiKey('anthropic', userSettings['anthropicAPIKey']);
    });
    ipcMain.on('settings:close', (event) => {
        closeSettingsWindow();
    });
    ipcMain.on('create-task:close', (event) => {
        closeCreateTask();
    });
    ipcMain.handle('get-models', async (event) => {
        availableModels = {};
        if (settings.getApiKey('openai') != null) {
            availableModels['openai'] = models['openai'];
        }
        if (settings.getApiKey('mistralai') != null) {
            availableModels['mistralai'] = models['mistralai'];
        }
        if (settings.getApiKey('anthropic') != null) {
            availableModels['anthropic'] = models['anthropic'];
        }
        return availableModels;
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
