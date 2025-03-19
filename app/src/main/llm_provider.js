const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');

class LLMProviderBase {
    constructor(apiKey, store) {
        this.apiKey = apiKey;
        this.store = store;
    }
    async requestAPI(model, messages, instructions) {
        throw new Error('Not implemented');
    }
    async getModels() {
        throw new Error('Not implemented');
    }
    async chatCompletion(model, messages, instructions) {
        await this.requestAPI(model, messages, instructions);
        const textResponse = this.getTextResponse();
        const promptTokens = this.getPromptTokens();
        const completionTokens = this.getCompletionTokens();
        const totalTokens = this.getTotalTokens();
        return {
            textResponse: textResponse,
            promptTokens: promptTokens,
            completionTokens: completionTokens,
            totalTokens: totalTokens
        };
    }
    getTextResponse() {
        return this.response.choices[0].message.content;
    }
    getPromptTokens() {
        return this.response.usage.prompt_tokens;
    }
    getCompletionTokens() {
        return this.response.usage.completions_tokens;
    }
    getTotalTokens() {
        return this.response.usage.total_tokens;
    }
}
class OpenAIWrapper extends LLMProviderBase {
    constructor(apiKey, store) {
        super(apiKey, store);
        this.openai = new OpenAI({
            apiKey: apiKey
        });
    }
    async requestAPI(model, messages, instructions) {
        const instructionMessage = {
            role: 'system',
            content: instructions
        };
        const messagesWithInstructions = [instructionMessage, ...messages];
        this.response = await this.openai.chat.completions.create({
            model: model,
            messages: messagesWithInstructions,
            temperature: 1,
            max_tokens: 1024,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0
        });
    }
    _filterModels(models) {
        const startsWith = ['gpt-', 'o'];
        const blacklist = ['instruct', 'moderation', 'audio', 'realtime'];
        return models.reduce((acc, model) => {
            if (
                startsWith.some((el) => model['id'].startsWith(el)) &&
                blacklist.every((el) => !model['id'].includes(el))
            ) {
                acc.push(model['id']);
            }
            return acc;
        }, []);
    }
    async getModels() {
        try {
            const response = await this.openai.models.list();
            const filteredModels = this._filterModels(response.data);
            return filteredModels;
        } catch (error) {
            console.log('Error fetching OpenAI models:', error);
            return error;
        }
    }
}
class MistralAIWrapper extends LLMProviderBase {
    constructor(apiKey, store) {
        super(apiKey, store);
        this.baseURL = 'https://api.mistral.ai/v1';
    }
    async requestAPI(model, messages, instructions) {
        const instructionMessage = {
            role: 'system',
            content: instructions
        };
        const messagesWithInstructions = [instructionMessage, ...messages];
        try {
            const response = await fetch(`${this.baseURL}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    Authorization: `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: model,
                    messages: messagesWithInstructions,
                    temperature: 1,
                    max_tokens: 1024,
                    top_p: 1
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}.`);
            }
            this.response = await response.json();
        } catch (error) {
            // Handle errors here
            console.error('Error:', error);
            throw new Error(error.message);
        }
    }
    _filterModels(models) {
        return models.reduce((acc, model) => {
            if (
                model['capabilities']['completion_chat'] &&
                model['id'].endsWith('latest')
            ) {
                acc.push(model['id']);
            }
            return acc;
        }, []);
    }
    async getModels() {
        try {
            const rawResponse = await fetch(`${this.baseURL}/models`, {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${this.apiKey}`
                }
            });
            const jsonResponse = await rawResponse.json();
            return this._filterModels(jsonResponse.data);
        } catch (error) {
            console.log('Error fetching MistralAI models list.', error);
        }
    }
}
class AnthropicWrapper extends LLMProviderBase {
    constructor(apiKey, store) {
        super(apiKey, store);
        this.anthropic = new Anthropic({ apiKey: apiKey });
    }
    replaceSystemRole(messages) {
        return messages.map((message) => {
            if (message.role === 'system') {
                return { ...message, role: 'assistant' };
            }
            return message;
        });
    }
    async requestAPI(model, messages, instructions) {
        this.response = await this.anthropic.messages.create({
            model: this.model,
            max_tokens: 1000,
            temperature: 0,
            system: instructions,
            messages: this.replaceSystemRole(messages)
        });
    }
    getTextResponse() {
        return this.response.content[0].text;
    }
    getPromptTokens() {
        return this.response.usage.input_tokens;
    }
    getCompletionTokens() {
        return this.response.usage.output_tokens;
    }
    getTotalTokens() {
        return (
            this.response.usage.input_tokens + this.response.usage.output_tokens
        );
    }
    _filterModels(models) {
        const blacklist = ['Old'];
        return models.reduce((acc, model) => {
            if (blacklist.every((el) => !model['id'].includes(el))) {
                acc.push(model['id']);
            }
            return acc;
        }, []);
    }
    async getModels() {
        const listModels = await this.anthropic.models.list({ limit: 1000 });
        return this._filterModels(listModels.data);
    }
}
class OpenRouterWrapper extends LLMProviderBase {
    constructor(apiKey, store) {
        super(apiKey, store);
        this.openai = new OpenAI({
            apiKey: apiKey,
            baseURL: 'https://openrouter.ai/api/v1'
        });
    }
    async requestAPI(model, messages, instructions) {
        const instructionMessage = {
            role: 'system',
            content: instructions
        };
        const messagesWithInstructions = [instructionMessage, ...messages];
        this.response = await this.openai.chat.completions.create({
            model: model,
            messages: messagesWithInstructions,
            temperature: 1,
            max_tokens: 1024,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
            extra_headers: {
                'HTTP-Referer': 'https://github.com/louisdecharson/converse',
                'X-Title': 'Converse'
            }
        });
    }
    _filterModels(models) {
        const blacklist = [];
        return models.reduce((acc, model) => {
            if (blacklist.every((el) => !model['id'].includes(el))) {
                acc.push(model['id']);
            }
            return acc;
        }, []);
    }
    async getModels() {
        try {
            const response = await this.openai.models.list();
            const filteredModels = this._filterModels(response.data);
            return filteredModels;
        } catch (error) {
            console.log('Error fetching OpenRouter models:', error);
            return error;
        }
    }
}
module.exports = {
    OpenAIWrapper,
    MistralAIWrapper,
    AnthropicWrapper,
    OpenRouterWrapper: OpenRouterWrapper
};
