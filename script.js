document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const addTaskButton = document.getElementById('addTask');
    const taskList = document.getElementById('taskList');
    const taskDateInput = document.getElementById('taskDate');
    const appearanceSelect = document.getElementById('appearance');

    // Load tasks from localStorage
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    // Function to apply theme
    const applyTheme = (theme) => {
        document.documentElement.classList.toggle('dark-mode', theme === 'dark');
        localStorage.setItem('theme', theme);

        // Reorder options in the dropdown
        const selectedOption = appearanceSelect.querySelector(`option[value="${theme}"]`);
        if (selectedOption) {
            appearanceSelect.prepend(selectedOption);
        }
    };

    // Load saved theme on initial render
    const savedTheme = localStorage.getItem('theme') || 'dark';
    applyTheme(savedTheme);
    appearanceSelect.value = savedTheme;

    // Helper to format date as dd-mm-yyyy
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const [year, month, day] = dateStr.split('-');
        return `${day}-${month}-${year}`;
    };

    // Function to save tasks to localStorage
    const saveTasks = () => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    };

    // Function to create a new task element
    const createTaskElement = (task) => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        li.dataset.taskId = task.id;
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', () => toggleTask(task.id));

        // Content container for text and date
        const contentDiv = document.createElement('div');
        contentDiv.className = 'task-content';

        const spanText = document.createElement('span');
        spanText.className = 'task-text-display';
        spanText.textContent = task.text;

        const inputText = document.createElement('input');
        inputText.type = 'text';
        inputText.className = 'task-text-edit hidden';
        inputText.value = task.text;

        const dateSpan = document.createElement('span');
        dateSpan.className = 'task-date-display';
        if (task.date) {
            dateSpan.textContent = ` ${formatDate(task.date)}`;
        }

        const inputDate = document.createElement('input');
        inputDate.type = 'date';
        inputDate.className = 'task-date-edit hidden';
        inputDate.value = task.date;

        contentDiv.appendChild(spanText);
        contentDiv.appendChild(inputText);
        contentDiv.appendChild(dateSpan);
        contentDiv.appendChild(inputDate);

        const editButton = document.createElement('button');
        editButton.className = 'edit-btn';
        editButton.textContent = 'Edit';
        editButton.addEventListener('click', () => enableInlineEdit(li, task.id));

        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-btn';
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', () => deleteTask(task.id));

        li.appendChild(checkbox);
        li.appendChild(contentDiv);
        li.appendChild(editButton);
        li.appendChild(deleteButton);
        
        return li;
    };

    const enableInlineEdit = (listItem, taskId) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        listItem.classList.add('editing');
        
        // Hide display elements, show edit elements
        listItem.querySelector('.task-text-display').classList.add('hidden');
        listItem.querySelector('.task-date-display').classList.add('hidden');
        listItem.querySelector('.task-text-edit').classList.remove('hidden');
        listItem.querySelector('.task-date-edit').classList.remove('hidden');

        // Change buttons
        const editBtn = listItem.querySelector('.edit-btn');
        const deleteBtn = listItem.querySelector('.delete-btn');

        editBtn.textContent = 'Save';
        editBtn.className = 'save-btn';
        editBtn.removeEventListener('click', () => enableInlineEdit(listItem, taskId));
        editBtn.addEventListener('click', () => saveInlineEdit(listItem, taskId));

        deleteBtn.textContent = 'Cancel';
        deleteBtn.className = 'cancel-btn';
        deleteBtn.removeEventListener('click', () => deleteTask(taskId));
        deleteBtn.addEventListener('click', () => cancelInlineEdit(listItem, taskId));
    };

    const saveInlineEdit = (listItem, taskId) => {
        const newText = listItem.querySelector('.task-text-edit').value.trim();
        const newDate = listItem.querySelector('.task-date-edit').value;

        if (!newDate) {
            alert('Please specify the date');
            return;
        }

        if (!newText) {
            alert('Task text cannot be empty');
            return;
        }

        tasks = tasks.map(task => {
            if (task.id === taskId) {
                return { ...task, text: newText, date: newDate };
            }
            return task;
        });
        saveTasks();
        renderTasks();
    };

    const cancelInlineEdit = (listItem, taskId) => {
        renderTasks();
    };

    // Function to render all tasks
    const renderTasks = (newTaskId = null) => {
        taskList.innerHTML = '';
        
        tasks.forEach(task => {
            const taskElement = createTaskElement(task);
            if (newTaskId && task.id === newTaskId) {
                taskElement.classList.add('task-item-new');
                taskElement.classList.add('fade-in');
                setTimeout(() => {
                    taskElement.classList.remove('task-item-new');
                }, 700);
            }
            taskList.appendChild(taskElement);
        });
    };

    // Function to add a new task
    const addTask = () => {
        const text = taskInput.value.trim();
        const date = taskDateInput.value;
        
        if (!text) {
            alert('Enter any task to do');
            return;
        }

        if (!date) {
            alert('Please specify the date');
            return;
        }
        
        if (text) {
            const task = {
                id: Date.now(),
                text: text,
                date: date,
                completed: false
            };
            tasks.push(task);
            saveTasks();
            renderTasks(task.id);
            taskInput.value = '';
            taskDateInput.value = '';
        }
    };

    // Function to toggle task completion
    const toggleTask = (taskId) => {
        tasks = tasks.map(task => {
            if (task.id === taskId) {
                return { ...task, completed: !task.completed };
            }
            return task;
        });
        saveTasks();
        renderTasks();
    };

    // Function to delete a task
    const deleteTask = (taskId) => {
        const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
        if (taskElement) {
            taskElement.classList.add('fade-out');
            taskElement.addEventListener('animationend', () => {
                tasks = tasks.filter(task => task.id !== taskId);
                saveTasks();
                renderTasks();
            }, { once: true });
        } else {
            tasks = tasks.filter(task => task.id !== taskId);
            saveTasks();
            renderTasks();
        }
    };

    // Event listeners
    addTaskButton.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });
    
    // Clear All button functionality
    const clearAllButton = document.getElementById('clearAll');
    clearAllButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all tasks?')) {
            tasks = [];
            saveTasks();
            renderTasks();
        }
    });

    // Appearance change listener
    appearanceSelect.addEventListener('change', (e) => {
        applyTheme(e.target.value);
    });

    // Initial render
    renderTasks();
});
