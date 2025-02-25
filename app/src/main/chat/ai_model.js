const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');

class AIModel {
    constructor(model, apiKey) {
        this.model = model;
        this.apiKey = apiKey;
    }
    async requestAPI(messages, instructions) {
        throw new Error('Not implemented');
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
    async chatCompletion(messages, instructions) {
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
}

class GPTModel extends AIModel {
    constructor(model, apiKey) {
        super(model, apiKey);
        this.openai = new OpenAI({
            apiKey: apiKey
        });
    }
    async requestAPI(messages, instructions) {
        const instructionMessage = {
            role: 'system',
            content: instructions
        };
        const messagesWithInstructions = [instructionMessage, ...messages];
        this.response = await this.openai.chat.completions.create({
            model: this.model,
            messages: messagesWithInstructions,
            temperature: 1,
            max_tokens: 1024,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0
        });
    }
}

class MistralModel extends AIModel {
    constructor(model, apiKey) {
        super(model, apiKey);
    }
    async requestAPI(messages, instructions) {
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
                        model: this.model,
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
}
class AnthropicModel extends AIModel {
    constructor(model, apiKey) {
        super(model, apiKey);
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
    async requestAPI(messages, instructions) {
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
}
class OpenRouterModel extends AIModel {
    constructor(model, apiKey) {
        super(model, apiKey);
        this.openai = new OpenAI({
            apiKey: apiKey,
            baseURL: 'https://openrouter.ai/api/v1'
        });
    }
    async requestAPI(messages, instructions) {
        const instructionMessage = {
            role: 'system',
            content: instructions
        };
        const messagesWithInstructions = [instructionMessage, ...messages];
        this.response = await this.openai.chat.completions.create({
            model: this.model,
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
}
module.exports = { MistralModel, GPTModel, AnthropicModel, OpenRouterModel };
