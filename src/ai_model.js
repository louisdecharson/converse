const OpenAI = require('openai');

class AIModel {
    constructor(model, apiKey, promptInstructions) {
        this.model = model;
        this.apiKey = apiKey;
        this.promptInstructions = promptInstructions;
    }
}

class GPTModel extends AIModel {
    constructor(model, apiKey, promptInstructions) {
        super(model, apiKey, promptInstructions);
        this.openai = new OpenAI({
            apiKey: apiKey
        });
    }
    async chatCompletion(text) {
        const response = await this.openai.chat.completions.create({
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
        return response.choices[0].message.content;
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
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            // Handle errors here
            console.error('Error:', error);
            throw new Error(error);
        }
    }
}

module.exports = {
    MistralModel: MistralModel,
    GPTModel: GPTModel
};
