const searchInput = document.getElementById('search-input');
const refreshModels = document.getElementById('refresh-models');

class ModelsTable {
    constructor() {
        this.tbody = document.getElementById('models-table-content');
        this.models = [];
    }
    async getAllModels() {
        this.models = await window.electronAPI.getAllModels();
    }
    addRow(modelItem) {
        const { provider, model, id, favorite } = modelItem;
        const newRow = document.createElement('tr');
        const rowClasses = ['even:bg-gray-50', 'dark:even:bg-neutral-700'];
        newRow.classList.add(...rowClasses);
        const favoriteSymbol = favorite ? '★' : '☆';
        const classesCell = 'py-1 whitespace-nowrap text-sm';
        newRow.innerHTML = `
    <td class="${classesCell}">${provider}</td>
    <td class="${classesCell}">${model}</td>
    <td class="${classesCell}" data-modelid="${id}" onclick="favModel(this)">${favoriteSymbol}</td>`;
        this.tbody.appendChild(newRow);
    }
    display() {
        this.tbody.innerHTML = '';
        this.userInput = searchInput.value.toLowerCase().split(' ');
        const skip = searchInput.value == '';
        this.models
            .filter((model) => this.filter(skip, model))
            .forEach((model) => this.addRow(model));
    }
    filter(skip, model) {
        if (skip) {
            return true;
        }
        for (const input of this.userInput) {
            let match = false;
            for (const [key, value] of Object.entries(model)) {
                if (
                    typeof value === 'string' &&
                    value.toLowerCase().includes(input)
                ) {
                    match = true;
                }
            }
            if (!match) {
                return false;
            }
        }
        return true;
    }
}
const favModel = (favElement) => {
    const modelId = favElement.getAttribute('data-modelid');
    if (favElement.innerHTML == '★') {
        window.electronAPI.unfavModel(modelId);
        favElement.innerHTML = '☆';
    } else if (favElement.innerHTML == '☆') {
        window.electronAPI.favModel(modelId);
        favElement.innerHTML = '★';
    }
};

const models = new ModelsTable();
models.getAllModels().then(() => models.display());
searchInput.addEventListener('input', (event) => {
    models.display();
});

refreshModels.addEventListener('click', (event) => {
    refreshModels.classList.add('animate-spin');
    window.electronAPI.refreshModels().then(() => {
        refreshModels.classList.remove('animate-spin');
        models.display();
    });
});
