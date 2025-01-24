// Submission form
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
        const provider = document.getElementById('provider-select').value;
        const model = document.getElementById('model-select').value;
        const promptInstructions = document.getElementById(
            'prompt-instructions'
        ).value;
        const messages = [
            {
                role: 'user',
                content: document.getElementById('text-input').value
            }
        ];
        try {
            const { textResponse, rowId } = await window.electronAPI.chat({
                messages,
                provider,
                model,
                promptInstructions,
                taskId
            });
            document.getElementById('output-text').innerText =
                marked.parse(textResponse);
            showElement('beautify-button-text');
            showElement('output');
            enableElement('submit');
            hideElement('loading-spinner');

            // add to history
            localHistory.addItem(
                rowId,
                provider,
                model,
                promptInstructions,
                messages,
                textResponse
            );
        } catch (error) {
            document.getElementById('error').innerHTML =
                'Error when processing your request. ' + error;
            showElement('beautify-button-text');
            enableElement('submit');
            hideElement('loading-spinner');
        }
    });

localHistory = new LocalHistory();
localHistory.load();
