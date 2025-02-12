class Chat {
    constructor() {
        this.messages = [];
        this.conversationElement = document.getElementById('conversation');
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
        this.appendMessage('user', message);
        // add logic to append an article html node to node with id conversation
    }
    addLLMMessage(message) {
        this.messages.push({
            role: 'system',
            content: message
        });
        this.appendMessage('system', message);
        // add logic to append an article html node to node with id conversation
    }
    appendMessage(role, message) {
        const messageDivContainer = document.createElement('div');
        const messageDiv = document.createElement('div');
        messageDiv.innerHTML = marked.parse(message);

        // Applying Tailwind classes based on sender
        let classesContainer =
            'flex flex-col text-start flex max-w-full flex-col flex-grow text-start';
        let classes =
            'p-2 rounded-lg my-1 relative min-h-8 gap-2 whitespace-normal break-words mx-auto text-base md:gap-5 lg:gap-6';
        if (role === 'user') {
            messageDiv.className = `${classes} bg-gray-100 text-gray-900 dark:text-gray-100 dark:bg-neutral-700 w-full max-w-70`;
            messageDivContainer.className = `${classesContainer} items-end`;
        } else {
            messageDiv.className = `${classes} text-gray-900 dark:text-gray-100`;
            messageDivContainer.className = `${classesContainer} items-start`;
        }
        messageDivContainer.appendChild(messageDiv);
        this.conversationElement.appendChild(messageDivContainer);
        this.conversationElement.scrollTop =
            this.conversationElement.scrollHeight;
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
        const userMessage = chatTextarea.value.trim();
        const formattedMessage = userMessage.replace(/\n/g, '<br>');
        if (userMessage) {
            submitMessage(userMessage, formattedMessage);
        }
        chatPromptDiv.innerText = '';
    }
});
// Add a click event listener to the chat-container
chatComposer.addEventListener('click', () => {
    // Focus on the chat-prompt to enable typing
    chatPromptDiv.focus();
});
const submitMessage = async (message, formattedMessage) => {
    chat.addUserMessage(formattedMessage);
    const provider = document.getElementById('provider-select').value;
    const model = document.getElementById('model-select').value;
    const promptInstructions = document.getElementById(
        'prompt-instructions'
    ).value;
    if (!currentChatId) {
        currentChatId = crypto.getRandomValues(new Uint32Array(1))[0];
    }
    try {
        const { textResponse, chatId } = await window.electronAPI.chat({
            messages: chat.messages,
            provider,
            model,
            promptInstructions,
            taskId,
            chatId: currentChatId
        });
        chat.addLLMMessage(textResponse);
        localHistory.addItem(
            currentChatId,
            provider,
            model,
            promptInstructions,
            JSON.stringify(chat.messages),
            ''
        );
    } catch (error) {
        document.getElementById('error').innerHTML =
            'Error when processing your request. ' + error;
    }
};

// start new chat
const newChatButton = document.getElementById('new-chat-button');
newChatButton.addEventListener('click', () => {
    chat.clear();
    currentChatId = crypto.getRandomValues(new Uint32Array(1))[0];
});

// History
localHistory = new LocalHistory(chat);
localHistory.load();
