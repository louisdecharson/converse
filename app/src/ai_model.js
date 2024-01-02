const OpenAI = require('openai');

class AIModel {
    constructor(model, apiKey, promptInstructions) {
        this.model = model;
        this.apiKey = apiKey;
        this.promptInstructions = promptInstructions;
    }
    async requestAPI(text) {
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
    async chatCompletion(text) {
        this.response = await this.requestAPI(text);
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
    constructor(model, apiKey, promptInstructions) {
        super(model, apiKey, promptInstructions);
        this.openai = new OpenAI({
            apiKey: apiKey
        });
    }
    async requestAPI(text) {
        this.response = await this.openai.chat.completions.create({
            model: this.model,
            messages: [
                {
                    role: 'system',
                    content: this.promptInstructions
                },
                {
                    role: 'user',
                    content: text
                }
            ],
            temperature: 1,
            max_tokens: 1024,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0
        });
    }
}

class MistralModel extends AIModel {
    constructor(model, apiKey, promptInstructions) {
        super(model, apiKey, promptInstructions);
    }
    async chatCompletion(text) {
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
                        messages: [
                            {
                                role: 'system',
                                content: this.promptInstructions
                            },
                            {
                                role: 'user',
                                content: text
                            }
                        ],
                        temperature: 1,
                        max_tokens: 1024,
                        top_p: 1
                    })
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}.`);
            }
            const data = await response.json();
            this.response = data.choices[0].message.content;
        } catch (error) {
            // Handle errors here
            console.error('Error:', error);
            throw new Error(error.message);
        }
    }
}

module.exports = {
    MistralModel: MistralModel,
    GPTModel: GPTModel
};
