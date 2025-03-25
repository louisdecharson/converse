const searchInput = document.getElementById('search-input');
const historyTableContent = document.getElementById('history-table-content');
class HistoryTable {
    constructor(maxCharLength = 50) {
        this.tbody = historyTableContent;
        this.history = [];
        this.maxCharLength = maxCharLength;
    }
    async getAllHistory() {
        this.history = await window.electronAPI.getAllHistory();
    }
    trimConversation(userContent, response) {
        let expandedUserContent = userContent;
        try {
            expandedUserContent = JSON.parse(userContent)
                .reduce((acc, item) => {
                    acc.push(item.content);
                    return acc;
                }, [])
                .join(' ');
        } catch (e) {}
        const conversation = expandedUserContent + ' -> ' + response;
        return this._trim(conversation);
    }
    _trim(string, maxLength = this.maxCharLength) {
        if (string.length > maxLength) {
            return string.substring(0, maxLength - 3) + '...';
        }
        return string;
    }
    _beautifyTimestamp(timestamp) {
        const date = new Date(timestamp);
        return this._trim(date.toLocaleString(), this.maxCharLength / 2);
    }
    addRow(historyItem) {
        const {
            rowid: rowId,
            timestamp,
            user,
            model,
            model_provider: modelProvider,
            prompt_instructions: promptInstructions,
            user_content: userContent,
            response,
            prompt_tokens: promptTokens,
            completion_tokens: completionTokens,
            total_tokens: totalTokens,
            task_id: taskId,
            chat_id: chatId,
            task_name: taskName
        } = historyItem;
        const newRow = document.createElement('tr');
        newRow.setAttribute('data-task-id', taskId);
        newRow.setAttribute('data-chat-id', chatId);
        newRow.setAttribute('data-row-id', rowId);
        newRow.onclick = () => {
            window.location.href = `/task/${taskId}?chat_id=${chatId}&history_rowid=${rowId}`;
        };
        const rowClasses = [
            'even:bg-gray-50',
            'dark:even:bg-neutral-700',
            'table',
            'table-fixed',
            'w-full',
            'hover:bg-gray-100',
            'dark:hover:bg-neutral-600',
            'cursor-pointer'
        ];
        newRow.classList.add(...rowClasses);
        const classesCell = 'py-1 whitespace-nowrap text-sm';
        newRow.innerHTML = `
        <td class="${classesCell} w-1/8">${this._trim(
            taskName,
            this.maxCharLength / 2
        )}</td>
        <td class="${classesCell} w-1/4">${this.trimConversation(
            userContent,
            response
        )}</td>
        <td class="${classesCell} w-1/4">${this._trim(promptInstructions)}</td>
        <td class="${classesCell} w-1/8">${this._beautifyTimestamp(
            timestamp
        )}</td>
        <td class="${classesCell} w-1/8">${this._trim(
            modelProvider,
            this.maxCharLength / 2
        )}</td>
        <td class="${classesCell} w-1/8">${this._trim(
            model,
            this.maxCharLength / 2
        )}</td>

        `;
        this.tbody.appendChild(newRow);
    }
    filter(skip, historyItem) {
        if (skip) {
            return true;
        }
        return this.userInput.every((input) =>
            Object.values(historyItem).some(
                (value) =>
                    typeof value === 'string' &&
                    value.toLowerCase().includes(input)
            )
        );
    }
    display() {
        this.tbody.innerHTML = '';
        this.userInput = searchInput.value.toLowerCase().split(' ');
        const skip = searchInput.value == '';
        this.history
            .filter((historyItem) => this.filter(skip, historyItem))
            .forEach((historyItem) => this.addRow(historyItem));
    }
}
function getCharacterCountInElement(elem) {
    const rect = elem.getBoundingClientRect();
    const elementWidth = rect.width;

    // Create a temporary canvas to measure text width
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    // Get the font of the element
    context.font = window.getComputedStyle(elem).font;

    // Measure the width of an average character (e.g., 'M' or 'W')
    const averageCharWidth = context.measureText('M').width;

    // Calculate the number of characters that can fit in the element's width
    const characterCount = Math.floor(elementWidth / averageCharWidth);

    return characterCount * 1.5;
}
const conversationHeader = document.getElementById('conversation-header');

const fullHistory = new HistoryTable(
    getCharacterCountInElement(conversationHeader)
);
fullHistory.getAllHistory().then(() => {
    fullHistory.display();
});
searchInput.addEventListener('input', () => {
    fullHistory.display();
});
resizeTableObserver = new ResizeObserver(() => {
    fullHistory.maxCharLength = getCharacterCountInElement(conversationHeader);
    fullHistory.display();
});
resizeTableObserver.observe(historyTableContent);
