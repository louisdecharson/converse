document
    .getElementById('api-keys-form')
    .addEventListener('submit', function (event) {
        event.preventDefault();
        const newSettings = {
            openaiAPIKey: event.target.openaiAPIKey.value,
            mistralAPIKey: event.target.mistralAPIKey.value,
            anthropicAPIKey: event.target.anthropicAPIKey.value,
            openRouterAPIKey: event.target.openRouterAPIKey.value
        };
        window.electronAPI.saveSettings(newSettings);
        console.log('settings sent');
        window.electronAPI.closeSettings();
    });
window.electronAPI.viewSettings((settings) => {
    document.getElementById('openaiAPIKey').value =
        settings['openaiAPIKey'] || '';
    document.getElementById('mistralAPIKey').value =
        settings['mistralAPIKey'] || '';
    document.getElementById('anthropicAPIKey').value =
        settings['anthropicAPIKey'] || '';
    document.getElementById('openRouterAPIKey').value =
        settings['openRouterAPIKey'] || '';
    if (settings['displayWelcomeMessage']) {
        document.getElementById('welcome-message').classList.remove('hidden');
    }
    console.log(settings);
});

document.getElementById('cancel').addEventListener('click', () => {
    window.electronAPI.closeSettings();
});
