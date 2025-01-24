class LocalHistory {
    constructor(chat) {
        this.chat = chat; // chat object - undefined in text_mode
        this.maxNbItems = 10;
        this.history = {}; // JS object of the history sql table
        this.htmlTable = document.getElementById('chat-history-table');
        this.displayedItems = new Set(); // set of items added on the html table
        this.orderedChatIds = []; // array of ordered chat ids
    }
    addItem(
        chat_id,
        provider,
        model,
        promptInstructions,
        user_content,
        response
    ) {
        if (!this.orderedChatIds.includes(chat_id)) {
            orderedChatIds = [chat_id].concat(orderedChatIds);
        }
        this.history[chat_id] = {
            user_content: user_content,
            response: response,
            model_provider: provider,
            model: model,
            prompt_instructions: promptInstructions,
            chat_id: chat_id
        };
        this.displayTable();
    }
    async load() {
        console.log('Loading history');
        const array = await window.electronAPI.viewMoreHistory(
            this.maxNbItems,
            taskId
        );
        for (const item of array) {
            this.history[item['chat_id']] = item;
            if (!this.orderedChatIds.includes(item['chat_id'])) {
                this.orderedChatIds.push(item['chat_id']);
            }
        }
        this.displayTable();
    }
    async loadMore() {
        console.log('Loading more history');
        this.maxNbItems += 10;
        await this.load();
    }
    displayTable() {
        if (this.chat) {
            this.htmlTable.innerHTML = '';
        }
        for (const chatId of this.orderedChatIds) {
            const item = this.history[chatId];
            const itemId = `chat-${chatId}`;
            if (!this.displayedItems.has(itemId) || this.chat) {
                this.displayItem(item, chatId);
                this.displayedItems.add(itemId);
            }
        }
    }
    getText(user_content) {
        try {
            return JSON.parse(user_content)[0].content;
        } catch (error) {
            const userText = user_content[0].content;
            if (userText) {
                return userText;
            }
            return user_content;
        }
    }
    displayItem(item, chatId) {
        const textUser = this.getText(item.user_content);
        const snippet = processString(textUser, 40);
        const newRow = this.htmlTable.insertRow(0);

        // Set the background color based on the row index
        newRow.className = 'mb-2';

        // Add a cell to the row
        var cell = newRow.insertCell(0);
        cell.className = `cursor-pointer p-1 border-b border-gray-300 dark:border-gray-500 dark:bg-neutral-600 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-600`;
        cell.textContent = snippet;
        cell.addEventListener('click', () => {
            document.getElementById('provider-select').value =
                item.model_provider;
            updateModels();
            document.getElementById('model-select').value = item.model;
            document.getElementById('prompt-instructions').innerText =
                item.prompt_instructions;
            if (this.chat) {
                currentChatId = chatId;
                chat.clear();
                for (const message of JSON.parse(item.user_content)) {
                    if (message.role === 'user') {
                        chat.addUserMessage(message.content);
                    } else if (message.role === 'system') {
                        chat.addLLMMessage(message.content);
                    }
                }
                chat.addLLMMessage(item.response);
            } else {
                document.getElementById('text-input').value = textUser;
                showElement('output');
                document.getElementById('output-text').innerText =
                    item.response;
            }
        });
    }
}
