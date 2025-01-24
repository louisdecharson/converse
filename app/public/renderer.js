// Utils
const showElement = (id) => {
    //document.getElementById(id).style.display = 'block';
    document.getElementById(id).classList.remove('hidden');
};
const hideElement = (id) => {
    document.getElementById(id).classList.add('hidden');
};
const disableElement = (id) => {
    document.getElementById(id).disabled = true;
};
const enableElement = (id) => {
    document.getElementById(id).disabled = false;
};
const processString = (inputString, maxLength) => {
    // Replace non-visible characters
    var sanitizedString = inputString.replace(/[\x00-\x1F\x7F-\x9F]/g, ' ');

    // Shorten the string if it exceeds the maximum length
    if (sanitizedString.length > maxLength) {
        sanitizedString = sanitizedString.substring(0, maxLength - 3) + '...';
    }

    return sanitizedString;
};
const mainWindow = document.getElementById('main-window');

const taskId = parseInt(
    document.getElementById('app-title').getAttribute('data-taskid')
);

// Hide and show prompt instructions
displayInstructionsButton = document.getElementById('display-instructions');
hideElement('prompt-instructions-container');
let instructionsDisplayed = false;
displayInstructionsButton.addEventListener('click', () => {
    if (instructionsDisplayed) {
        hideElement('prompt-instructions-container');
        displayInstructionsButton.innerHTML = 'Show Prompt Instructions';
        instructionsDisplayed = false;
    } else {
        showElement('prompt-instructions-container');
        displayInstructionsButton.innerHTML = 'Hide Prompt Instructions';
        instructionsDisplayed = true;
    }
});

// Provider & Model selection
const providerSelect = document.getElementById('provider-select');
const modelSelect = document.getElementById('model-select');

// get list of models
let models;
const getModels = async () => {
    models = await window.electronAPI.getModels();

    // Populate providers
    for (const provider in models) {
        const option = document.createElement('option');
        option.value = provider;
        option.textContent = provider;
        providerSelect.appendChild(option);
    }
    updateModels();
};

// Function to populate models based on selected provider
const updateModels = () => {
    const selectedProvider = providerSelect.value;
    modelSelect.innerHTML = '';
    if (selectedProvider && models[selectedProvider]) {
        const providerModels = models[selectedProvider];
        providerModels.forEach((model) => {
            const option = document.createElement('option');
            option.value = model;
            option.textContent = model;
            modelSelect.appendChild(option);
        });
    }
};

// Populate the providers when the document loads
getModels();

// Add event listener to update models when a provider is selected
providerSelect.addEventListener('change', updateModels);

// Sidebar
const toggleSidebar = () => {
    const sidebar = document.getElementById('sidebar');
    const mainContainer = document.getElementById('main-container');

    // Toggle sidebar width and main content margin
    if (sidebar.style.width === '' || sidebar.style.width === '0px') {
        sidebar.style.width = '200px';
        mainContainer.style.marginLeft = '200px';
    } else {
        sidebar.style.width = '0';
        mainContainer.style.marginLeft = '0';
    }
};
document.getElementById('toggle-sidebar').addEventListener('click', () => {
    toggleSidebar();
});

window.electronAPI.viewHistory(() => {
    toggleSidebar();
});

const taskbar = document.getElementById('taskbar');
document.addEventListener('scroll', () => {
    // Check if the user has scrolled down
    if (window.scrollY > 0) {
        // If scrolled down, add a class to the taskbar
        taskbar.classList.add('border-b');
    } else {
        // If at the top, remove the class
        taskbar.classList.remove('border-b');
    }
});

document
    .getElementById('history-load-more')
    .addEventListener('click', async () => {
        localHistory.loadMore();
    });
