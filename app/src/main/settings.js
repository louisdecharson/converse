const Store = require('electron-store');

class Settings {
    static API_KEYS_MAPPING = {
        openai: 'settings:openai-api-key',
        mistralai: 'settings:mistral-api-key',
        anthropic: 'settings:anthropic-api-key',
        openrouter: 'settings:openrouter-api-key'
    };
    constructor(store) {
        this.store = store;
        this.apiKeyNames = Object.values(Settings.API_KEYS_MAPPING);
    }
    get(key) {
        return this.store.get(key);
    }
    set(key, value) {
        this.store.set(key, value);
    }
    hasDefinedApiKeys() {
        return this.apiKeyNames.some((key) => this.store.get(key));
    }
    setApiKey(provider, value) {
        const key = Settings.API_KEYS_MAPPING[provider];
        if (!key) {
            throw new Error(`Key for ${provider} is not defined.`);
        }
        this.set(key, value);
    }
    getApiKey(provider) {
        const key = Settings.API_KEYS_MAPPING[provider];
        if (!key) {
            throw new Error(`Key for ${provider} is not defined.`);
        }
        return this.get(key);
    }
    isValidApiKey(key) {
        return this.apiKeyNames.includes(key);
    }
}
module.exports = Settings;
