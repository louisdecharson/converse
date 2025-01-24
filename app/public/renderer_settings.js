document
    .getElementById('api-keys-form')
    .addEventListener('submit', function (event) {
        event.preventDefault();
        const newSettings = {
            openaiAPIKey: event.target.openaiAPIKey.value,
            mistralAPIKey: event.target.mistralAPIKey.value,
            anthropicAPIKey: event.target.anthropicAPIKey.value
        };
        window.electronAPI.saveSettings(newSettings);
        console.log('settings sent');
        window.electronAPI.closeSettings();
    });
window.electronAPI.viewSettings((settings) => {
    document.getElementById('openaiAPIKey').value = settings['openaiAPIKey'];
    document.getElementById('mistralAPIKey').value = settings['mistralAPIKey'];
    document.getElementById('anthropicAPIKey').value =
        settings['anthropicAPIKey'];
});

document.getElementById('cancel').addEventListener('click', () => {
    window.electronAPI.closeSettings();
});
