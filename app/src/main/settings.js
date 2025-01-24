class Settings {
    constructor(store) {
        this.store = store;
    }
    get() {
        return {
            openaiAPIKey: this.store.get('settings:openai-api-key'),
            mistralAIAPIKey: this.store.get('settings:mistral-ai-api-key')
        };
    }
    set(openaiAPIKey, mistralAIAPIKey) {
        this.store.set('settings:openai-api-key', openaiAPIKey);
        this.store.set('settings:mistral-api-key', mistralAIAPIKey);
    }
}
