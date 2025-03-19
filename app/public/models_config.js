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
        const rowClasses = [
            'even:bg-gray-50',
            'dark:even:bg-neutral-700',
            'table',
            'table-fixed',
            'w-full'
        ];
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
        // Early return if search is empty
        if (skip) {
            return true;
        }

        // Check if all search terms match at least one field in the model
        return this.userInput.every((input) =>
            Object.values(model).some(
                (value) =>
                    typeof value === 'string' &&
                    value.toLowerCase().includes(input)
            )
        );
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
    const svgIcon = refreshModels.getElementsByTagName('svg')[0];
    svgIcon.classList.add('animate-spin');
    window.electronAPI.refreshModels().then((listModels) => {
        models.models = Object.values(listModels);
        svgIcon.classList.remove('animate-spin');
        models.display();
    });
});
