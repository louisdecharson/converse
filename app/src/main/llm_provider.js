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
        await this.requestAPI(messages, instructions);
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
    // async getModels() {
    //     try {
    //         const response = await openai.models.list();
    //         return response.data;
    //     } catch (error) {
    //         console.log('Error fetching OpenAI models');
    //         return error;
    //     }
    // }
    async getModels() {
        return [
            'gpt-3.5-turbo',
            'gpt-3.5-turbo-16k',
            'gpt-4o-mini',
            'gpt-4',
            'gpt-4o',
            'gpt-4-turbo',
            'gpt-4-turbo-preview',
            'gpt-4-32k',
            'gpt-4-1106-preview'
        ];
    }
}
class MistralAIWrapper extends LLMProviderBase {
    constructor(apiKey, store) {
        super(apiKey, store);
    }
    async requestAPI(model, messages, instructions) {
        const instructionMessage = {
            role: 'system',
            content: instructions
        };
        const messagesWithInstructions = [instructionMessage, ...messages];
        try {
            const response = await fetch(
                'https://api.mistral.ai/v1/chat/completions',
                {
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
                }
            );

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
    async getModels() {
        return [
            'mistral-large-latest',
            'mistral-moderation-latest',
            'ministral-3b-latest',
            'ministral-8b-latest',
            'open-mistral-nemo',
            'mistral-small-latest',
            'codestral-latest'
        ];
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
    async getModels() {
        return [
            'claude-3-7-sonnet-latest',
            'claude-3-5-sonnet-latest',
            'claude-3-5-haiku-latest',
            'claude-3-opus-20240229'
        ];
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
    async getModels() {
        return [
            'deepseek/deepseek-r1',
            'google/gemini-flash-1.5',
            'google/gemini-2.0-flash-001'
        ];
    }
}
module.exports = {
    OpenAIWrapper,
    MistralAIWrapper,
    AnthropicWrapper,
    OpenRouterWrapper: OpenRouterWrapper
};
