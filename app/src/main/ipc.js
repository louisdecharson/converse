// IPC Logic
const { ipcMain } = require('electron');
const models = require('./models.js');

const ipc = (
    chatHistory,
    tasksTable,
    llmRouter,
    store,
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
                chatId || taskId
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
            true
        );
        return rows;
    });
    ipcMain.on('settings:set', (event, settings) => {
        store.set('settings:openai-api-key', settings['openaiAPIKey']);
        store.set('settings:mistral-api-key', settings['mistralAPIKey']);
        store.set('settings:anthropic-api-key', settings['anthropicAPIKey']);
    });
    ipcMain.on('settings:close', (event) => {
        closeSettingsWindow();
    });
    ipcMain.on('create-task:close', (event) => {
        closeCreateTask();
    });
    ipcMain.handle('get-models', async (event) => {
        availableModels = {};
        if (store.get('settings:openai-api-key') != null) {
            availableModels['openai'] = models['openai'];
        }
        if (store.get('settings:mistral-api-key') != null) {
            availableModels['mistralai'] = models['mistralai'];
        }
        if (store.get('settings:anthropic-api-key') != null) {
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
