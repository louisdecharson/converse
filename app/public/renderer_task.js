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
displayInstructionsButton = document.getElementById('display-instructions');
displayInstructionsContainer = document.getElementById(
    'prompt-instructions-container'
);
hideElement('prompt-instructions-container');
let instructionsDisplayed = false;
displayInstructionsButton.addEventListener('click', () => {
    const displayInstructionsButtonRect =
        displayInstructionsButton.getBoundingClientRect();
    const sidebarWidth = sidebar.getBoundingClientRect().width;
    if (instructionsDisplayed) {
        hideElement('prompt-instructions-container');
        instructionsDisplayed = false;
        displayInstructionsButton.classList.remove('bg-gray-200');
        displayInstructionsButton.classList.remove('dark:bg-neutral-600');
    } else {
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
});

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

const displayModelSelectPopup = document.getElementById('display-model-select');
const modelSelectPopup = document.getElementById('model-select-popup');

displayModelSelectPopup.addEventListener('click', (event) => {
    const rect = displayModelSelectPopup.getBoundingClientRect();
    const sidebarWidth = sidebar.getBoundingClientRect().width;
    modelSelectPopup.style.left = `${
        rect.left + window.scrollX - sidebarWidth
    }px`; // Set left position
    modelSelectPopup.style.top = `${rect.bottom + 5}px`; // Set top position
    modelSelectPopup.classList.toggle('hidden'); // Show the popup
    if (modelSelectPopup.classList.contains('hidden')) {
        displayModelSelectPopup.classList.remove('bg-gray-200');
        displayModelSelectPopup.classList.remove('dark:bg-neutral-600');
    } else {
        displayModelSelectPopup.classList.add('bg-gray-200');
        displayModelSelectPopup.classList.add('dark:bg-neutral-600');
    }
});
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
    } else {
        hideElement('output');
        document.getElementById('output-text').innerHTML = '';
        document.getElementById('text-input').value = '';
    }
});

let currentChatId;
