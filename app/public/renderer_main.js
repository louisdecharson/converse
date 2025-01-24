const clickableDivs = document.querySelectorAll('.clickable');
clickableDivs.forEach((div) => {
    div.addEventListener('click', () => {
        div.classList.toggle('border-blue-500');
    });
});
const confirmDeletePopup = document.getElementById('popup-confirmation-delete');
const confirmDeleteButton = document.getElementById('confirm-delete');
const deleteTask = async (taskId, buttonElement) => {
    try {
        const response = await fetch(`/task/${taskId}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            console.error('Network error during DELETE request');
        } else {
            buttonElement.parentElement.parentElement.remove();
            confirmDeletePopup.classList.add('hidden');
        }
    } catch (error) {
        console.error('Error during DELETE request:', error);
    }
};
const deleteItem = (buttonElement) => {
    const taskId = buttonElement.getAttribute('data-taskid');
    const taskName = buttonElement.getAttribute('data-taskname');
    document.getElementById('delete-task-name').innerHTML = taskName;
    confirmDeletePopup.classList.remove('hidden');
    confirmDeleteButton.addEventListener('click', () => {
        deleteTask(taskId, buttonElement);
    });
};
document.getElementById('cancel-delete').addEventListener('click', () => {
    confirmDeletePopup.classList.add('hidden');
});
const pinItem = (buttonElement) => {
    const taskId = buttonElement.getAttribute('data-taskid');
    console.log(`${taskId} clicked`);
    const svg = buttonElement.querySelector('svg');
    const taskElement = buttonElement.parentElement.parentElement;
    if (svg.getAttribute('fill') === 'none') {
        svg.setAttribute('fill', 'currentColor');
        window.electronAPI.pinTask(taskId);
        taskElement.classList.add('pinned');
    } else {
        svg.setAttribute('fill', 'none');
        window.electronAPI.unpinTask(taskId);
        taskElement.classList.remove('pinned');
    }
    togglePinnedview();
};
let showPinnedOnly = false; // all tasks are showed
const togglePinnedview = () => {
    const tasks = document.querySelectorAll('.tasks');
    tasks.forEach((task) => {
        if (showPinnedOnly) {
            if (!task.classList.contains('pinned')) {
                task.classList.add('hidden');
            } else {
                task.classList.remove('hidden');
            }
        } else {
            task.classList.remove('hidden');
        }
    });
};
const buttonSelectPinned = document.getElementById('tasks-select-pinned');
const buttonSelectAll = document.getElementById('tasks-select-all');
buttonSelectAll.addEventListener('click', () => {
    showPinnedOnly = false;
    togglePinnedview();
    buttonSelectAll.classList.add('selected');
    buttonSelectPinned.classList.remove('selected');
});
buttonSelectPinned.addEventListener('click', () => {
    showPinnedOnly = true;
    togglePinnedview();
    buttonSelectAll.classList.remove('selected');
    buttonSelectPinned.classList.add('selected');
});
