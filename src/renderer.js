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

const settingsWindow = document.getElementById('settings-window');
const mainWindow = document.getElementById('main-window');

document
    .getElementById('text-form')
    .addEventListener('submit', async (event) => {
        event.preventDefault();

        // reset DOM
        document.getElementById('error').innerText = '';

        // Disable button
        disableElement('submit');
        showElement('loading-spinner');
        hideElement('beautify-button-text');

        // Get the text from textarea
        const text = document.getElementById('text-input').value;
        try {
            const response = await window.electronAPI.beautify(text);
            document.getElementById('output-text').innerText = response;
            showElement('beautify-button-text');
            showElement('output');
            enableElement('submit');
            hideElement('loading-spinner');
        } catch (error) {
            document.getElementById('error').innerHTML =
                'Error when processing your request. ' + error;
            showElement('beautify-button-text');
            enableElement('submit');
            hideElement('loading-spinner');
        }
    });

// Settings interactions
const setSettings = (settings) => {
    document.getElementById('openai-apiKey').value = settings['openAIAPIKey'];
    document.getElementById('mistralai-apiKey').value =
        settings['mistralAIAPIKey'];
    document.getElementById('promptInstructions').value =
        settings['promptInstructions'];
    document.getElementById('aiModels').value = settings['aiModel'];
};
window.electronAPI.viewSettings((settings, showWelcomeMessage) => {
    setSettings(settings);
    settingsWindow.classList.remove('hidden');
    if (showWelcomeMessage) {
        showElement('welcome');
        hideElement('advanced-settings');
    } else {
        hideElement('welcome');
        showElement('advanced-settings');
    }
});
settingsWindow.addEventListener('click', function (event) {
    if (event.target === settingsWindow) {
        settingsWindow.classList.add('hidden');
    }
});

document
    .getElementById('settings')
    .addEventListener('submit', async (event) => {
        event.preventDefault();

        // Save settings
        const newSettings = {
            openAIAPIKey: document.getElementById('openai-apiKey').value,
            mistralAIAPIKey: document.getElementById('mistralai-apiKey').value,
            promptInstructions:
                document.getElementById('promptInstructions').value,
            aiModel: document.getElementById('aiModels').value
        };
        window.electronAPI.setSettings(newSettings);

        // Close settings window
        settingsWindow.classList.add('hidden');
    });

document.addEventListener('DOMContentLoaded', () => {
    const copyButton = document.getElementById('copy-to-clipboard');
    const outputText = document.getElementById('output-text');

    copyButton.addEventListener('click', function () {
        // Create a range and selection object
        const range = document.createRange();
        const selection = window.getSelection();

        // Select the text content of the output-text div
        range.selectNodeContents(outputText);
        selection.removeAllRanges();
        selection.addRange(range);

        // Execute the copy command
        document.execCommand('copy');

        // Deselect the text after copying
        selection.removeAllRanges();
        showElement('copy-to-clipboard-success');
        hideElement('copy-to-clipboard-text');
        disableElement('copy-to-clipboard');
        setTimeout(() => {
            hideElement('copy-to-clipboard-success');
            showElement('copy-to-clipboard-text');
            enableElement('copy-to-clipboard');
        }, 1000);
    });
});
