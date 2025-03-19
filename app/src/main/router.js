const {
    OpenAIWrapper,
    AnthropicWrapper,
    MistralAIWrapper,
    OpenRouterWrapper
} = require('./llm_provider.js');

class Router {
    constructor(settings) {
        this.settings = settings;
        this.setupProviders();
    }
    setupProviders() {
        this.providers = {};
        if (this.settings.getApiKey('openai') != null) {
            this.providers['openai'] = new OpenAIWrapper(
                this.settings.getApiKey('openai')
            );
        }
        if (this.settings.getApiKey('mistralai') != null) {
            this.providers['mistralai'] = new MistralAIWrapper(
                this.settings.getApiKey('anthropic')
            );
        }
        if (this.settings.getApiKey('anthropic') != null) {
            this.providers['anthropic'] = new AnthropicWrapper(
                this.settings.getApiKey('openrouter')
            );
        }
        if (this.settings.getApiKey('openrouter') != null) {
            this.providers['openrouter'] = new OpenRouterWrapper(
                this.settings.getApiKey('mistralai')
            );
        }
    }
    async fetchModels() {
        const availableModels = {};
        for (const [providerName, providerWrapper] of Object.entries(
            this.providers
        )) {
            availableModels[providerName] = await providerWrapper.getModels();
        }
        console.log(availableModels);
        return availableModels;
    }
    async chat(provider, modelName, instructions, text) {
        let model;
        if (provider === null) {
            throw new Error(
                `LLM Model >${modelName}< is unknown and Provider >${provider}< is not recognized.`
            );
        } else {
            model = this.providers[provider];
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
