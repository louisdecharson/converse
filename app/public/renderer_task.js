// Utils
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
const processString = (inputString, maxLength) => {
    // Replace non-visible characters
    var sanitizedString = inputString.replace(/[\x00-\x1F\x7F-\x9F]/g, ' ');

    // Shorten the string if it exceeds the maximum length
    if (sanitizedString.length > maxLength) {
        sanitizedString = sanitizedString.substring(0, maxLength - 3) + '...';
    }

    return sanitizedString;
};
const mainWindow = document.getElementById('main-window');

const taskId = parseInt(
    document.getElementById('app-title').getAttribute('data-taskid')
);

// Hide and show prompt instructions
const displayInstructionsButton = document.getElementById(
    'display-instructions'
);
const displayInstructionsContainer = document.getElementById(
    'prompt-instructions-container'
);
const displayModelSelectPopup = document.getElementById('display-model-select');
const modelSelectPopup = document.getElementById('model-select-popup');

hideElement('prompt-instructions-container');
let instructionsDisplayed = false;
hideDisplayInstruction = () => {
    hideElement('prompt-instructions-container');
    instructionsDisplayed = false;
    displayInstructionsButton.classList.remove('bg-gray-200');
    displayInstructionsButton.classList.remove('dark:bg-neutral-600');
};

toggledisplayInstruction = () => {
    const displayInstructionsButtonRect =
        displayInstructionsButton.getBoundingClientRect();
    const sidebarWidth = sidebar.getBoundingClientRect().width;
    if (instructionsDisplayed) {
        hideDisplayInstruction();
    } else {
        hideModelSelectPopup();
        displayInstructionsContainer.style.left = `${
            displayInstructionsButtonRect.left + window.scrollX - sidebarWidth
        }px`;
        displayInstructionsContainer.style.top = `${
            displayInstructionsButtonRect.bottom + 5
        }px`; // Set top position
        showElement('prompt-instructions-container');
        instructionsDisplayed = true;
        displayInstructionsButton.classList.add('bg-gray-200');
        displayInstructionsButton.classList.add('dark:bg-neutral-600');
    }
};
displayInstructionsButton.addEventListener('click', toggledisplayInstruction);

// Sidebar
const sidebar = document.getElementById('sidebar');
const toggleSidebar = () => {
    const mainContainer = document.getElementById('main-container');

    // Toggle sidebar width and main content margin
    if (sidebar.style.width === '' || sidebar.style.width === '0px') {
        sidebar.style.width = '200px';
        mainContainer.style.marginLeft = '200px';
    } else {
        sidebar.style.width = '0';
        mainContainer.style.marginLeft = '0';
    }
};
document.getElementById('toggle-sidebar').addEventListener('click', () => {
    toggleSidebar();
});

// History
window.electronAPI.viewHistory(() => {
    toggleSidebar();
});

const taskbar = document.getElementById('taskbar');
document.addEventListener('scroll', () => {
    // Check if the user has scrolled down
    if (window.scrollY > 0) {
        // If scrolled down, add a class to the taskbar
        taskbar.classList.add('border-b');
    } else {
        // If at the top, remove the class
        taskbar.classList.remove('border-b');
    }
});

document
    .getElementById('history-load-more')
    .addEventListener('click', async () => {
        localHistory.loadMore();
    });

hideModelSelectPopup = () => {
    modelSelectPopup.classList.add('hidden');
    displayModelSelectPopup.classList.remove('bg-gray-200');
    displayModelSelectPopup.classList.remove('dark:bg-neutral-600');
};
toggleModelSelectPopup = () => {
    const rect = displayModelSelectPopup.getBoundingClientRect();
    const sidebarWidth = sidebar.getBoundingClientRect().width;
    modelSelectPopup.style.left = `${
        rect.left + window.scrollX - sidebarWidth
    }px`; // Set left position
    modelSelectPopup.style.top = `${rect.bottom + 5}px`; // Set top position
    if (modelSelectPopup.classList.contains('hidden')) {
        hideDisplayInstruction();
        modelSelectPopup.classList.remove('hidden');
        displayModelSelectPopup.classList.add('bg-gray-200');
        displayModelSelectPopup.classList.add('dark:bg-neutral-600');
    } else {
        hideModelSelectPopup();
    }
};

displayModelSelectPopup.addEventListener('click', () =>
    toggleModelSelectPopup()
);
window.addEventListener('click', (event) => {
    if (
        !modelSelectPopup.contains(event.target) &&
        modelSelectPopup.classList.contains('hidden')
    ) {
        modelSelectPopup.classList.add('hidden');
    }
});
// start new chat
const newTaskButton = document.getElementById('new-task-button');
newTaskButton.addEventListener('click', () => {
    if (typeof chat !== 'undefined') {
        chat.clear();
        currentChatId = crypto.getRandomValues(new Uint32Array(1))[0];
        document.getElementById('error').innerHTML = '';
    } else {
        hideElement('output');
        document.getElementById('output-text').innerHTML = '';
        document.getElementById('text-input').value = '';
    }
});
const { Marked } = globalThis.marked;
const { markedHighlight } = globalThis.markedHighlight;
const marked = new Marked(
    markedHighlight({
        emptyLangClass: 'hljs',
        langPrefix: 'hljs language-',
        highlight(code, lang, info) {
            const language = hljs.getLanguage(lang) ? lang : 'plaintext';
            return hljs.highlight(code, { language }).value;
        }
    })
);
let currentChatId;
// highlight.js and dark / light mode
function setTheme() {
    const lightTheme = document.getElementById('theme-light');
    const darkTheme = document.getElementById('theme-dark');

    if (
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
    ) {
        darkTheme.removeAttribute('disabled');
        lightTheme.setAttribute('disabled', 'true');
    } else {
        lightTheme.removeAttribute('disabled');
        darkTheme.setAttribute('disabled', 'true');
    }
}

// Set theme on initial load
setTheme();

// Listen for changes
window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', setTheme);

// Search for text
function scrollToText(searchText) {
    // Get the body text and HTML elements
    const bodyText = document.body.innerText;
    const index = bodyText.indexOf(searchText);

    if (index !== -1) {
        // Create a Range to find the position of the text
        const range = document.createRange();
        const selection = window.getSelection();

        // Clear any previous selections
        selection.removeAllRanges();

        // Create a text node and set the range
        const textNode = document.createTextNode(bodyText);
        document.body.appendChild(textNode);
        const endIndex = index + searchText.length;

        // Set the range to the found text
        range.setStart(textNode, index);
        range.setEnd(textNode, endIndex);
        selection.addRange(range);

        // Scroll the text into view
        const rect = range.getBoundingClientRect();
        window.scrollTo({
            top:
                rect.top +
                window.scrollY -
                window.innerHeight / 2 +
                rect.height / 2,
            behavior: 'smooth'
        });
        console.log('done');

        // Remove the text node after scrolling
        document.body.removeChild(textNode);
    } else {
        console.log('Text not found.');
    }
}
