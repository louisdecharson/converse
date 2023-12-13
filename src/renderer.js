const showElement = (id) => {
    document.getElementById(id).style.display = 'block';
};
const hideElement = (id) => {
    document.getElementById(id).style.display = 'none';
};

const disableElement = (id) => {
    document.getElementById(id).disabled = true;
};
const enableElement = (id) => {
    document.getElementById(id).disabled = false;
};

window.electronAPI.getApiKey((msg) => {
    console.log('API key requested', msg);
    showElement('prompt-api-key');
    hideElement('main-window');
});
hideElement('prompt-api-key');
hideElement('loadingSpinner');
hideElement('output');

const settingsWindow = document.getElementById('settings-window');
const mainWindow = document.getElementById('main-window');

const submitApiKey = async () => {
    const apiKey = document.getElementById('apiKeyInit').value;
    const response = await window.electronAPI.setApiKey(apiKey);
    hideElement('prompt-api-key');
    showElement('main-window');
};

document
    .getElementById('text-form')
    .addEventListener('submit', async (event) => {
        event.preventDefault();

        // reset DOM
        document.getElementById('error').innerText = '';
        showElement('loadingSpinner');
        disableElement('submit');

        // Get the text from textarea
        const text = document.getElementById('text-input').value;
        try {
            const response = await window.electronAPI.beautify(text);
            document.getElementById('output-text').innerText =
                response.choices[0].message.content;
            showElement('output');
            hideElement('loadingSpinner');
            enableElement('submit');
        } catch (error) {
            document.getElementById('error').innerHTML =
                'Error when processing your request. ' + error;
        }
    });

// Settings interactions
const setSettings = (settings) => {
    document.getElementById('apiKey').value = settings['apiKey'];
    document.getElementById('promptInstructions').value =
        settings['promptInstructions'];
    document.getElementById('gptModels').value = settings['gptModel'];
};
window.electronAPI.viewSettings((settings) => {
    setSettings(settings);
    settingsWindow.classList.remove('hidden');
    // mainWindow.classList.add('opacity-50');
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
            apiKey: document.getElementById('apiKey').value,
            promptInstructions:
                document.getElementById('promptInstructions').value,
            gptModel: document.getElementById('gptModels').value
        };
        window.electronAPI.setSettings(newSettings);

        // Close settings window
        settingsWindow.classList.add('hidden');
        // mainWindow.classList.remove('opacity-50');
    });
