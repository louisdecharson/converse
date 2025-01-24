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
                taskId,
                chatId: crypto.getRandomValues(new Uint32Array(1))[0]
            });
            document.getElementById('output-text').innerHTML =
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
localHistory = new LocalHistory();
localHistory.load();
