const {
    MistralModel,
    GPTModel,
    AnthropicModel
} = require('./chat/ai_model.js');

class Router {
    constructor(store) {
        this.store = store;
    }
    async chat(provider, modelName, instructions, text) {
        let model;
        if (provider === null) {
            throw new Error(
                `LLM Model >${modelName}< is unknown and Provider >${provider}< is not recognized.`
            );
        } else if (provider === 'openai') {
            model = new GPTModel(
                modelName,
                this.store.get('settings:openai-api-key')
            );
        } else if (provider === 'anthropic') {
            model = new AnthropicModel(
                modelName,
                this.store.get('settings:anthropic-api-key')
            );
        } else if (provider === 'mistralai') {
            model = new MistralModel(
                modelName,
                this.store.get('settings:mistral-api-key')
            );
        }
        const { textResponse, promptTokens, completionTokens, totalTokens } =
            await model.chatCompletion(text, instructions);
        return {
            textResponse,
            promptTokens,
            completionTokens,
            totalTokens
        };
    }
}
module.exports = Router;
