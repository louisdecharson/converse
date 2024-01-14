import 'dotenv/config';

const modelToModelProvider = {
    'gpt-4-1106-preview': 'openAI',
    'gpt-3.5-turbo-1106': 'openAI',
    'mistral-tiny': 'mistralAI'
};

class AIModel {
    constructor(model, apiKey) {
        this.model = model;
        this.apiKey = apiKey;
    }
    async requestAPI(promptInstructions, text) {
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
    async chatCompletion(promptInstructions, text) {
        this.response = await this.requestAPI(promptInstructions, text);
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
    async requestAPI(text, promptInstructions) {
        response = await this.openai.chat.completions.create({
            model: this.model,
            messages: [
                {
                    role: 'system',
                    content: promptInstructions
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
        return response;
    }
}

class MistralModel extends AIModel {
    constructor(model, apiKey) {
        super(model, apiKey);
    }
    async chatCompletion(text, promptInstructions) {
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
                                content: promptInstructions
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
            return data;
        } catch (error) {
            // Handle errors here
            console.error('Error:', error);
            throw new Error(error.message);
        }
    }
}

const getChatCompletion = async (model, promptInstructions, text) => {
    const modelProvider = modelToModelProvider(model);
    if (modelProvider === 'openAI') {
        model = new GPTModel(
            aiModel,
            process.env.OPENAI_API_KEY,
            promptInstructions
        );
    } else if (modelProvider === 'mistralAI') {
        model = new MistralModel(
            aiModel,
            process.env.MISTRALAI_API_KEY,
            promptInstructions
        );
    } else {
        throw new Error('Model unknown');
    }
    const { textReponse, promptTokens, completionTokens, totalTokens } =
        await model.chatCompletion(text);
    return {
        modelProvider,
        textReponse,
        promptTokens,
        completionTokens,
        totalTokens
    };
};

module.exports = {
    getChatCompletion: getChatCompletion
};
