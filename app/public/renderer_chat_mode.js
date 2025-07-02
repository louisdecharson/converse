const svgReload = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" width="18px" height="18px" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"/></svg>`;

class Chat {
    constructor() {
        this.messages = [];
        this.conversationElement = document.getElementById('conversation');
        this.container = document.getElementById('conversation-container');
        this.reloadButton = false;
    }
    clear() {
        this.messages = [];
        this.conversationElement.innerHTML = '';
        chatPromptDiv.innerText = '';
    }
    addUserMessage(message) {
        this.messages.push({
            role: 'user',
            content: message
        });
        this.appendMessage('user', message, true);
    }
    addLLMMessage(message) {
        this.messages.push({
            role: 'system',
            content: message
        });
        this.appendMessage('system', message);
    }
    appendMessage(role, message, appendReload = false) {
        const messageDivContainer = document.createElement('div');
        const messageDiv = document.createElement('div');
        messageDiv.innerHTML = marked.parse(message);

        // Applying Tailwind classes based on sender
        let classesContainer =
            'flex flex-col text-start flex max-w-full flex-col flex-grow text-start';
        let classes =
            'p-2 rounded-lg my-1 relative min-h-8 gap-2 whitespace-normal break-words text-base md:gap-5 lg:gap-6';
        if (role === 'user') {
            messageDiv.className = `${classes} bg-gray-100 text-gray-900 dark:text-gray-100 dark:bg-neutral-700 w-full max-w-70`;
            messageDivContainer.className = `${classesContainer} items-end`;
        } else {
            messageDiv.className = `${classes} text-gray-900 dark:text-gray-100`;
            messageDivContainer.className = `${classesContainer} items-start`;
        }
        messageDivContainer.appendChild(messageDiv);
        this.conversationElement.appendChild(messageDivContainer);
        this.container.scrollTop = this.container.scrollHeight;

        if (appendReload) {
            this.reloadButton = document.createElement('button');
            this.reloadButton.innerHTML =
                svgReload + `<span class="italic">Try again</span>`;
            this.reloadButton.className =
                'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 flex flex-row gap-2 hidden';
            this.reloadButton.addEventListener('click', () => {
                submitMessage();
                this.reloadButton.classList.toggle('hidden');
            });
            messageDivContainer.appendChild(this.reloadButton);
        }
    }
    displayReloadButton() {
        this.reloadButton.classList.toggle('hidden');
    }
}
const chat = new Chat();
const chatComposer = document.getElementById('composer');
const chatPromptDiv = document.getElementById('chat-prompt');
const chatTextarea = document.getElementById('chat-textarea');
chatPromptDiv.addEventListener('input', () => {
    chatTextarea.value = chatPromptDiv.innerText; // Mirror text from div to textarea
});
chatPromptDiv.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        if (event.shiftKey) {
            // Allow the default action of inserting a line break
            return;
        }
        event.preventDefault();
        triggerMessageSubmission();
    }
});
// Add a click event listener to the chat-container
chatComposer.addEventListener('click', () => {
    // Focus on the chat-prompt to enable typing
    chatPromptDiv.focus();
});
const loadingSpinner = document.getElementById('loading-spinner');
const chatContainer = document.getElementById('chat-container');
const triggerMessageSubmission = () => {
    const userMessage = chatTextarea.value.trim();

    if (userMessage) {
        // format user message
        const formattedMessage = userMessage.replace(/\n/g, '<br>');
        // add message to chat
        chat.addUserMessage(formattedMessage);

        // generate chatId
        if (!currentChatId) {
            currentChatId = crypto.getRandomValues(new Uint32Array(1))[0];
        }

        submitMessage();
    }
    chatPromptDiv.innerText = '';
};
const submitMessage = async () => {
    // show loadingSpinner
    loadingSpinner.classList.toggle('hidden');
    // reset error
    document.getElementById('error').innerHTML = '';

    // collect provider, model, promptinstructions
    const provider = document.getElementById('provider-select').value;
    const model = document.getElementById('model-select').value;
    const promptInstructions = document.getElementById(
        'prompt-instructions'
    ).value;
    try {
        const { textResponse, rowId } = await window.electronAPI.chat({
            messages: chat.messages,
            provider,
            model,
            promptInstructions,
            taskId,
            chatId: currentChatId
        });
        chatId = rowId;
        chat.addLLMMessage(textResponse);
        localHistory.addItem(
            currentChatId,
            provider,
            model,
            promptInstructions,
            JSON.stringify(chat.messages),
            ''
        );
        loadingSpinner.classList.toggle('hidden');
    } catch (error) {
        console.log(error);
        document.getElementById('error').innerHTML =
            'Error when processing your request. ' + error;
        loadingSpinner.classList.toggle('hidden');
        chat.displayReloadButton();
    }
};

// History
localHistory = new LocalHistory(chat);
localHistory.load();
