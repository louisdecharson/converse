const OpenAI = require('openai');

module.exports = {
    craftEmail: async (apiKey, promptInstructions, openAIGPTModel, content) => {
        const openai = new OpenAI({
            apiKey: apiKey
        });
        const response = await openai.chat.completions.create({
            model: openAIGPTModel,
            messages: [
                {
                    role: 'system',
                    content: promptInstructions
                },
                {
                    role: 'user',
                    content: content
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
};
