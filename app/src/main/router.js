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
                this.settings.getApiKey('mistralai')
            );
        }
        if (this.settings.getApiKey('anthropic') != null) {
            this.providers['anthropic'] = new AnthropicWrapper(
                this.settings.getApiKey('anthropic')
            );
        }
        if (this.settings.getApiKey('openrouter') != null) {
            this.providers['openrouter'] = new OpenRouterWrapper(
                this.settings.getApiKey('openrouter')
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
        return availableModels;
    }
    async chat(provider, modelName, instructions, text) {
        let providerWrapper;
        if (provider === null) {
            throw new Error(
                `LLM Model >${modelName}< is unknown and Provider >${provider}< is not recognized.`
            );
        } else {
            providerWrapper = this.providers[provider];
        }
        const { textResponse, promptTokens, completionTokens, totalTokens } =
            await providerWrapper.chatCompletion(modelName, text, instructions);
        return {
            textResponse,
            promptTokens,
            completionTokens,
            totalTokens
        };
    }
}
module.exports = Router;
