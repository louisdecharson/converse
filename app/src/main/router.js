const {
    MistralModel,
    GPTModel,
    AnthropicModel,
    OpenRouterModel
} = require('./chat/ai_model.js');

class Router {
    constructor(settings) {
        this.settings = settings;
    }
    async chat(provider, modelName, instructions, text) {
        let model;
        if (provider === null) {
            throw new Error(
                `LLM Model >${modelName}< is unknown and Provider >${provider}< is not recognized.`
            );
        } else if (provider === 'openai') {
            model = new GPTModel(modelName, this.settings.getApiKey(provider));
        } else if (provider === 'anthropic') {
            model = new AnthropicModel(
                modelName,
                this.settings.getApiKey(provider)
            );
        } else if (provider === 'mistralai') {
            model = new MistralModel(
                modelName,
                this.settings.getApiKey(provider)
            );
        } else if (provider === 'openrouter') {
            model = new OpenRouterModel(
                modelName,
                this.settings.getApiKey(provider)
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
