// const models = {
//     openai: [
//         'gpt-3.5-turbo',
//         'gpt-3.5-turbo-16k',
//         'gpt-4o-mini',
//         'gpt-4',
//         'gpt-4o',
//         'gpt-4-turbo',
//         'gpt-4-turbo-preview',
//         'gpt-4-32k',
//         'gpt-4-1106-preview'
//     ],
//     anthropic: [
//         'claude-3-7-sonnet-latest',
//         'claude-3-5-sonnet-latest',
//         'claude-3-5-haiku-latest',
//         'claude-3-opus-20240229'
//     ],
//     mistralai: [
//         'mistral-large-latest',
//         'mistral-moderation-latest',
//         'ministral-3b-latest',
//         'ministral-8b-latest',
//         'open-mistral-nemo',
//         'mistral-small-latest',
//         'codestral-latest'
//     ],
//     openrouter: [
//         'deepseek/deepseek-r1',
//         'google/gemini-flash-1.5',
//         'google/gemini-2.0-flash-001'
//     ]
// };
class Models {
    constructor(store) {
        this.store = store;
        this.store_key = 'models-dict';
        if (!store.has(this.store_key)) {
            store.set(this.store_key, {});
        }
        this.models = store.get(this.store_key);
    }
    getModelId(provider, model) {
        return `${provider}-${model}`;
    }
    getDefaultEntry(provider, model) {
        return {
            provider: provider,
            model: model,
            favorite: true,
            id: this.getModelId(provider, model)
        };
    }
    set(models) {
        this.store.set(this.store_key, models);
    }
    async refresh(router) {
        const rawModels = await router.fetchModels();
        const models = {};
        for (const [provider, providerModels] of Object.entries(rawModels)) {
            for (const model of providerModels) {
                const modelId = this.getModelId(provider, model);
                models[modelId] =
                    modelId in this.models
                        ? this.models[modelId]
                        : this.getDefaultEntry(provider, model);
            }
        }
        this.set(models);
    }
    get(provider, filterFavorites = false) {
        return Object.values(this.models).filter(
            (model) =>
                (provider === undefined || model.provider === provider) &&
                (!filterFavorites || model.favorite)
        );
    }
    getDict(provider, filterFavorites = false) {
        const modelsArray = this.get(provider, filterFavorites);
        return modelsArray.reduce((acc, { provider, model }) => {
            if (!acc[provider]) {
                acc[provider] = [];
            }
            acc[provider].push(model);
            return acc;
        }, {});
    }
    setFavorite(modelId) {
        this.models[modelId].favorite = true;
        this.set(this.models);
    }
    unsetFavorite(modelId) {
        this.models[modelId].favorite = false;
        this.set(this.models);
    }
}

module.exports = Models;
