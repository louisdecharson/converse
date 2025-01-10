const OpenAI = require('openai');
const { aiModelNameToProvider } = require('./config.js');
const { MistralModel, GPTModel } = require('./ai_model.js');

const craftEmail = async (
    openAIAPIKey,
    mistralAIAPIKey,
    promptInstructions,
    aiModel,
    text
) => {
    const aiModelProvider = aiModelNameToProvider[aiModel];
    let model;
    if (aiModelProvider === 'openAI') {
        model = new GPTModel(aiModel, openAIAPIKey, promptInstructions);
    } else if (aiModelProvider === 'mistralAI') {
        model = new MistralModel(aiModel, mistralAIAPIKey, promptInstructions);
    } else {
        throw new Error('Model unknown');
    }
    const { textResponse, promptTokens, completionTokens, totalTokens } =
        await model.chatCompletion(text);
    return {
        aiModelProvider,
        textResponse,
        promptTokens,
        completionTokens,
        totalTokens
    };
};

module.exports = {
    craftEmail: craftEmail
};
