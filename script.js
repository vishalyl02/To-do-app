// Retrieve existing todos from local storage or initialize an empty array
let todos = JSON.parse(localStorage.getItem('todos')) || [];

// Function to render the todo list with filters applied
function renderTodoList(filteredTodos) {
    const todoList = document.getElementById('todoList');
    todoList.innerHTML = '';

    const todosToRender = filteredTodos || todos;
    todosToRender.forEach((todo, index) => {
        const todoItem = document.createElement('li');
        todoItem.classList.add('task-item') 
        todoItem.innerHTML = `
            <span class="todo-text ${todo.done ? 'done' : ''}">${todo.text}</span>
            <span class="category">${todo.category}</span>
            <button class="subtask-btn" onclick="addSubtask(${index})">Add Subtask</button>
            <button class="edit-btn" onclick="editTodo(${index})">Edit</button>
            <button class="delete-btn" onclick="deleteTodo(${index})">Delete</button>
            <button class="done-undone-btn" onclick="toggleDoneUndone(${index})">${todo.done ? 'Undone' : 'Done'}</button>
            <span class="due-date">${todo.dueDate}</span>
            <span class="priority ${todo.priority}">${todo.priority}</span>
            <span class="tags">${todo.tags.join(', ')}</span>
        `;

        if (todo.subtasks) {
            const subtaskList = document.createElement('ul');
            subtaskList.className = 'subtasks';
            todo.subtasks.forEach(subtask => {
                const subtaskItem = document.createElement('li');
                subtaskItem.innerText = subtask;
                subtaskList.appendChild(subtaskItem);
            });
            todoItem.appendChild(subtaskList);
        }
        if (todo.reminder) {
            const reminderText = document.createElement('span');
            reminderText.classList.add('reminder');
            reminderText.innerText = `Reminder: ${todo.reminder}`;
            todoItem.appendChild(reminderText);
        }
        todoList.appendChild(todoItem);
    });
}

// Function to add a new todo
function addTodo() {
    const todoInput = document.getElementById('todoInput');
    const categoryDropdown = document.getElementById('categoryDropdown');
    const dueDateInput = document.getElementById('dueDateInput');
    const priorityDropdown = document.getElementById('priorityDropdown');
    const tagsInput = document.getElementById('tagsInput');

    const todoText = todoInput.value.trim();
    const category = categoryDropdown.value;
    const dueDate = dueDateInput.value;
    const priority = priorityDropdown.value;
    const tags = tagsInput.value.split(',').map(tag => tag.trim()).filter(tag => tag !== '');

    // Validate all required details for the task
    if (!todoText || !category || !dueDate || !priority) {
        alert('Please enter all details for the task!');
        return;
    }

    // Auto-complete due date if date format is found in the todo text
    autoCompleteDueDate(todoText);

    const newTodo = {
        text: todoText,
        category: category,
        dueDate: dueDate,
        priority: priority,
        tags: tags,
        done: false,
    };

    // Check if a reminder is set and schedule it
    if (dueDate && isReminderSet(dueDate)) {
        scheduleReminder(newTodo);
    }
    todos.unshift(newTodo); // Add new todo to the beginning of the array
    localStorage.setItem('todos', JSON.stringify(todos));
    renderTodoList();

    // Re-render the todo list with the new task on top
    renderTodoList();

    // Clear input fields after adding the task
    todoInput.value = '';
    categoryDropdown.value = '';
    dueDateInput.value = '';
    priorityDropdown.value = '';
    tagsInput.value = '';
}
// Function to set a reminder for a todo
function setReminder(todo) {
    const reminderDateTime = prompt("Enter the reminder date and time (YYYY-MM-DD HH:mm):");
    if (!reminderDateTime) {
        alert("Reminder not set. Please enter a valid date and time.");
        return;
    }

    const reminderDate = new Date(reminderDateTime);

    if (isNaN(reminderDate) || reminderDate <= new Date()) {
        alert("Reminder not set. Please enter a future date and time.");
        return;
    }

    todo.reminder = reminderDate.toISOString();
    saveTodosToLocalStorage();
    alert("Reminder set successfully!");
}

// Event listener for the "Set Reminder" button
setReminderBtn.addEventListener('click', () => {
    const selectedTodoId = todoInput.dataset.selectedTodoId;
    const todo = todos.find(todo => todo.id === selectedTodoId);
    if (todo) {
        setReminder(todo);
    } else {
        alert("Please select a todo before setting a reminder.");
    }
});

// Function to check if a reminder is set
function isReminderSet(dueDate) {
    const now = new Date().getTime();
    const dueDateTime = new Date(dueDate).getTime();
    return dueDateTime > now;
}

// Function to schedule a reminder as a notification
function scheduleReminder(todo) {
    const dueDateTime = new Date(todo.dueDate).getTime();
    const timeUntilDue = dueDateTime - new Date().getTime();

    // Show a reminder notification when the due date and time are reached
    setTimeout(() => {
        const notificationOptions = {
            body: `Reminder: "${todo.text}" is due now!`,
            icon: 'favicon.ico',
        };
        new Notification('Todo Reminder', notificationOptions);
    }, timeUntilDue);
}

// Request permission for notifications when the page loads
document.addEventListener('DOMContentLoaded', () => {
    if (Notification.permission !== 'granted') {
        Notification.requestPermission();
    }
});
// Function to add a subtask to a todo
function addSubtask(todoIndex) {
    const subtaskInput = prompt('Enter a subtask:');
    if (subtaskInput !== null && subtaskInput.trim() !== '') {
        if (!todos[todoIndex].subtasks) {
            todos[todoIndex].subtasks = [];
        }
        todos[todoIndex].subtasks.push(subtaskInput.trim());
        localStorage.setItem('todos', JSON.stringify(todos));
        renderTodoList();
    }
}
// Function to view reminder details for a todo
function viewReminderDetails(todo) {
    if (!todo.reminder) {
        alert("No reminder set for this task.");
    } else {
        const reminderDateTime = new Date(todo.reminder);
        alert(`Reminder for this task is set on: ${formatDate(reminderDateTime)}`);
    }
}

// Function to view activity logs for a todo
function viewActivityLogs(todo) {
    // You can implement the activity logs feature here.
    // For simplicity, let's just display an alert with a message.
    alert("Viewing Activity Logs for this task: Feature Coming Soon!");
}

// Function to view backlogs for a todo
function viewBacklogs(todo) {
    // You can implement the backlog feature here.
    // For simplicity, let's just display an alert with a message.
    alert("Viewing Backlogs for this task: Feature Coming Soon!");
}

// Event listener for the "View Reminder Details" button
todoList.addEventListener('click', event => {
    if (event.target.classList.contains('view-reminder-btn')) {
        const selectedTodoId = event.target.dataset.todoId;
        const todo = todos.find(todo => todo.id === selectedTodoId);
        if (todo) {
            viewReminderDetails(todo);
        }
    }
});

// Event listener for the "View Activity Logs" button
todoList.addEventListener('click', event => {
    if (event.target.classList.contains('view-activity-logs-btn')) {
        const selectedTodoId = event.target.dataset.todoId;
        const todo = todos.find(todo => todo.id === selectedTodoId);
        if (todo) {
            viewActivityLogs(todo);
        }
    }
});

// Event listener for the "View Backlogs" button
todoList.addEventListener('click', event => {
    if (event.target.classList.contains('view-backlogs-btn')) {
        const selectedTodoId = event.target.dataset.todoId;
        const todo = todos.find(todo => todo.id === selectedTodoId);
        if (todo) {
            viewBacklogs(todo);
        }
    }
});

// Function to edit an existing todo
function editTodo(index) {
    const todoInput = document.getElementById('todoInput');
    const categoryDropdown = document.getElementById('categoryDropdown');
    const dueDateInput = document.getElementById('dueDateInput');
    const priorityDropdown = document.getElementById('priorityDropdown');
    const tagsInput = document.getElementById('tagsInput');

    const todo = todos[index];
    todoInput.value = todo.text;
    categoryDropdown.value = todo.category;
    dueDateInput.value = todo.dueDate;
    priorityDropdown.value = todo.priority;
    tagsInput.value = todo.tags.join(', ');

    // Auto-complete due date if date format is found in the todo text
    autoCompleteDueDate(todo.text);

    // Remove the existing todo
    deleteTodo(index);
}

// Function to delete a todo
function deleteTodo(index) {
    todos.splice(index, 1);
    localStorage.setItem('todos', JSON.stringify(todos));
    renderTodoList();
}

// Function to mark a todo as done or undone
function toggleDoneUndone(index) {
    todos[index].done = !todos[index].done;
    localStorage.setItem('todos', JSON.stringify(todos));
    renderTodoList();
}

// Function to apply filters to the todo list
function applyFilters() {
    const dueDateFilter = document.getElementById('dueDateFilter').value;
    const categoryFilter = document.getElementById('categoryFilter').value;
    const priorityFilter = document.getElementById('priorityFilter').value;

    let filteredTodos = todos;

    // Filter by due date
    if (dueDateFilter !== '') {
        filteredTodos = filteredTodos.filter(todo => todo.dueDate === dueDateFilter);
    }

    // Filter by category
    if (categoryFilter !== '') {
        filteredTodos = filteredTodos.filter(todo => todo.category === categoryFilter);
    }

    // Filter by priority
    if (priorityFilter !== '') {
        filteredTodos = filteredTodos.filter(todo => todo.priority === priorityFilter);
    }

    renderTodoList(filteredTodos);
}

// Function to clear all filters and display all todos
function clearFilters() {
    document.getElementById('dueDateFilter').value = '';
    document.getElementById('categoryFilter').value = '';
    document.getElementById('priorityFilter').value = '';
    renderTodoList();
}

// Function to sort the todo list based on selected criteria
function sortTodoList() {
    const sortCriteria = document.getElementById('sortCriteria').value;
    let sortedTodos = [...todos];

    switch (sortCriteria) {
        case 'dueDateAsc':
            sortedTodos.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
            break;
        case 'dueDateDesc':
            sortedTodos.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));
            break;
        case 'priorityAsc':
            sortedTodos.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
            break;
        case 'priorityDesc':
            sortedTodos.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
            break;
        // Add more sorting criteria if needed
        default:
            break;
    }

    renderTodoList(sortedTodos);
}

// Function to clear sorting and display all todos
function clearSorting() {
    document.getElementById('sortCriteria').value = '';
    renderTodoList();
}

// Function to view backlogs (pending or missed tasks)
function viewBacklogs() {
    const currentDate = new Date().toISOString().split('T')[0];
    const backlogs = todos.filter(todo => !todo.done && todo.dueDate < currentDate);
    renderTodoList(backlogs);
}

// Function to view activity logs (all completed tasks)
function viewActivityLogs() {
    const activityLogs = todos.filter(todo => todo.done);
    renderTodoList(activityLogs);
}

// Function to perform the search
function search() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    let searchResults = [];

    // Exact Todo Search
    searchResults = todos.filter(todo => todo.text.toLowerCase() === searchInput);

    // Sub-tasks Search
    todos.forEach(todo => {
        if (todo.subtasks) {
            const matchingSubtasks = todo.subtasks.filter(subtask => subtask.toLowerCase().includes(searchInput));
            if (matchingSubtasks.length > 0) {
                const matchingTodo = { ...todo, subtasks: matchingSubtasks };
                searchResults.push(matchingTodo);
            }
        }
    });

    // Similar Words Search
    if (searchResults.length === 0) {
        searchResults = todos.filter(todo => todo.text.toLowerCase().includes(searchInput));
    }

    // Partial Search
    if (searchResults.length === 0) {
        searchResults = todos.filter(todo => todo.text.toLowerCase().includes(searchInput));
    }

    // Tags Search
    if (searchResults.length === 0) {
        searchResults = todos.filter(todo => todo.tags.some(tag => tag.toLowerCase().includes(searchInput)));
    }

    renderTodoList(searchResults);
}

// Function to handle the Date Auto Complete
function autoCompleteDueDate(todoText) {
    const dueDateInput = document.getElementById('dueDateInput');

    // Regex patterns to identify date formats in the todo text
    const tomorrowPattern = /\b(tomorrow)\b/i;
    const specificDatePattern = /\b(\d{1,2}\/\d{1,2}\/\d{4})\b/i;
    const dateTimePattern = /\b(\d{1,2}\/\d{1,2}\/\d{4}\s+\d{1,2}:\d{1,2}(am|pm)?)\b/i;

    if (tomorrowPattern.test(todoText)) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        dueDateInput.valueAsDate = tomorrow;
    } else if (specificDatePattern.test(todoText)) {
        const matchedDate = todoText.match(specificDatePattern)[0];
        const dateParts = matchedDate.split('/');
        const dueDate = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`);
        dueDateInput.valueAsDate = dueDate;
    } else if (dateTimePattern.test(todoText)) {
        const matchedDateTime = todoText.match(dateTimePattern)[0];
        const dateParts = matchedDateTime.split(/[\/\s+:]/);
        const dueDate = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]} ${dateParts[3]}:${dateParts[4]}`);
        dueDateInput.valueAsDate = dueDate;
    } else {
        // Reset the due date input if no valid date format is found in the todo text
        dueDateInput.value = '';
    }
}

// ... (Rest of the code)
// ... (Previous code)

// Function to clear the search input and display all todos
function clearSearch() {
    document.getElementById('searchInput').value = '';
    renderTodoList();
}

function clearLocalStorage() {
    localStorage.removeItem('todos');
    todos = []; // Clear the todos array in memory as well
    renderTodoList(); // Update the rendered todo list on the page
}

// Function to initialize the todo list and event listeners
function initialize() {
    // Render the todo list with initial data
    document.addEventListener('DOMContentLoaded', function () {
    renderTodoList();

    // Add event listeners
    document.getElementById('addTodoBtn').addEventListener('click', addTodo);
    document.getElementById('applyFiltersBtn').addEventListener('click', applyFilters);
    document.getElementById('clearFiltersBtn').addEventListener('click', clearFilters);
    document.getElementById('sortTodoBtn').addEventListener('click', sortTodoList);
    document.getElementById('clearSortingBtn').addEventListener('click', clearSorting);
    document.getElementById('viewBacklogsBtn').addEventListener('click', viewBacklogs);
    document.getElementById('viewActivityLogsBtn').addEventListener('click', viewActivityLogs);
    document.getElementById('searchBtn').addEventListener('click', search);
    document.getElementById('clearSearchBtn').addEventListener('click', clearSearch);
    });
    const todoList = document.getElementById('todoList');
    todoList.addEventListener('dragstart', dragStart);
    todoList.addEventListener('dragover', dragOver);
    todoList.addEventListener('dragleave', dragLeave);
    todoList.addEventListener('drop', drop);
}

// Function to handle the dragstart event
let draggedItem = null;

function dragStart(event) {
    draggedItem = event.target;
    event.dataTransfer.effectAllowed = 'move';
    // Set a custom data attribute to store the dragged item's ID
    event.dataTransfer.setData('text/plain', draggedItem.dataset.id);
}

// Function to handle the dragover event
function dragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    const targetItem = event.target;

    // Highlight the drop position for tasks
    if (targetItem.classList.contains('todo-item') || targetItem.classList.contains('subtasks')) {
        event.target.classList.add('drag-over');
    }
}

// Function to handle the drop event
function drop(event) {
    event.preventDefault();
    const targetItem = event.target;

    // Move the draggedItem before or after the targetItem
    if (targetItem.classList.contains('todo-item')) {
        targetItem.parentNode.insertBefore(draggedItem, targetItem);
    } else if (targetItem.classList.contains('subtasks')) {
        targetItem.appendChild(draggedItem);
    }

    // Remove the drag-over highlight class
    targetItem.classList.remove('drag-over');

    // Update the todo list order in the todos array
    updateTodoListOrder();

    // Save the updated todos to local storage
    localStorage.setItem('todos', JSON.stringify(todos));
}

// Function to handle the dragleave event
function dragLeave(event) {
    const targetItem = event.target;
    // Remove the drag-over highlight class when leaving the drop area
    targetItem.classList.remove('drag-over');
}

// Function to update the todo list order in the todos array
function updateTodoListOrder() {
    const updatedTodos = [];
    const todoList = document.getElementById('todoList');
    const todoItems = todoList.getElementsByClassName('todo-item');

    for (let i = 0; i < todoItems.length; i++) {
        const todoId = parseInt(todoItems[i].dataset.id, 10);
        const todo = todos.find(todo => todo.id === todoId);
        updatedTodos.push(todo);
    }

    todos = updatedTodos;
}
// Initialize the todo list and event listeners
initialize();
