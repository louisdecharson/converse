const searchInput = document.getElementById('search-input');
const onlyFavButton = document.getElementById('only-favorites');
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
        <td class="${classesCell} w-1/6">${provider}</td>
        <td class="${classesCell} w-2/3">${model}</td>
        <td class="${classesCell} w-1/6" data-modelid="${id}" onclick="favModel(this)">${favoriteSymbol}</td>`;
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
            return !showFavOnly || model['favorite'];
        }

        // Check if all search terms match at least one field in the model
        return (
            // true if showing favorites only or model is favorite
            (!showFavOnly || model['favorite']) &&
            // true if user input matches at least one field of model
            this.userInput.every((input) =>
                Object.values(model).some(
                    (value) =>
                        typeof value === 'string' &&
                        value.toLowerCase().includes(input)
                )
            )
        );
    }
}
const favModel = async (favElement) => {
    const modelId = favElement.getAttribute('data-modelid');
    if (favElement.innerHTML == '★') {
        window.electronAPI.unfavModel(modelId);
        favElement.innerHTML = '☆';
    } else if (favElement.innerHTML == '☆') {
        window.electronAPI.favModel(modelId);
        favElement.innerHTML = '★';
    }
    await models.getAllModels();
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

let showFavOnly = false; // all tasks are showed
onlyFavButton.addEventListener('click', (event) => {
    const svg = onlyFavButton.querySelector('svg');
    if (showFavOnly) {
        showFavOnly = false;
        svg.setAttribute('fill', 'none');
    } else {
        showFavOnly = true;
        svg.setAttribute('fill', 'currentColor');
    }
    models.display();
});

document.getElementById('done-button').addEventListener('click', () => {
    window.electronAPI.closeCurrentWindow();
});
