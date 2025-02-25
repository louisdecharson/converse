const models = {
    openai: [
        'gpt-3.5-turbo',
        'gpt-3.5-turbo-16k',
        'gpt-4o-mini',
        'gpt-4',
        'gpt-4o',
        'gpt-4-turbo',
        'gpt-4-turbo-preview',
        'gpt-4-32k',
        'gpt-4-1106-preview'
    ],
    anthropic: [
        'claude-3-7-sonnet-latest',
        'claude-3-5-sonnet-latest',
        'claude-3-5-haiku-latest',
        'claude-3-opus-20240229'
    ],
    mistralai: [
        'mistral-large-latest',
        'mistral-moderation-latest',
        'ministral-3b-latest',
        'ministral-8b-latest',
        'open-mistral-nemo',
        'mistral-small-latest',
        'codestral-latest'
    ],
    openrouter: [
        'deepseek/deepseek-r1',
        'google/gemini-flash-1.5',
        'google/gemini-2.0-flash-001'
    ]
};
module.exports = models;
