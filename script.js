// script.js
document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const dueDateInput = document.getElementById('dueDateInput');
    const priorityInput = document.getElementById('priorityInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    const filterBtns = document.querySelectorAll('.filter-btn');
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    addTaskBtn.addEventListener('click', addTask);
    taskList.addEventListener('click', handleTaskAction);
    taskList.addEventListener('dragstart', handleDragStart);
    taskList.addEventListener('dragover', handleDragOver);
    taskList.addEventListener('drop', handleDrop);
    filterBtns.forEach(btn => btn.addEventListener('click', filterTasks));

    renderTasks();

    function addTask() {
        const taskText = taskInput.value.trim();
        const dueDate = dueDateInput.value;
        const priority = priorityInput.value;

        if (taskText !== '') {
            const task = {
                id: Date.now(),
                text: taskText,
                dueDate: dueDate,
                priority: priority,
                completed: false
            };
            tasks.push(task);
            taskInput.value = '';
            dueDateInput.value = '';
            priorityInput.value = 'low';
            saveTasks();
            renderTasks();
        }
    }

    function handleTaskAction(e) {
        const taskId = e.target.closest('li').getAttribute('data-id');

        if (e.target.classList.contains('edit')) {
            editTask(taskId);
        } else if (e.target.classList.contains('delete')) {
            deleteTask(taskId);
        } else if (e.target.classList.contains('task-text')) {
            toggleComplete(taskId);
        }
    }

    function editTask(taskId) {
        const task = tasks.find(t => t.id == taskId);
        taskInput.value = task.text;
        dueDateInput.value = task.dueDate;
        priorityInput.value = task.priority;
        tasks = tasks.filter(t => t.id != taskId);
        saveTasks();
        renderTasks();
    }

    function deleteTask(taskId) {
        tasks = tasks.filter(t => t.id != taskId);
        saveTasks();
        renderTasks();
    }

    function toggleComplete(taskId) {
        const task = tasks.find(t => t.id == taskId);
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
    }

    function filterTasks(e) {
        filterBtns.forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        renderTasks();
    }

    function handleDragStart(e) {
        if (e.target.tagName === 'LI') {
            e.target.classList.add('dragging');
        }
    }

    function handleDragOver(e) {
        e.preventDefault();
        const dragging = document.querySelector('.dragging');
        const afterElement = getDragAfterElement(taskList, e.clientY);
        if (afterElement == null) {
            taskList.appendChild(dragging);
        } else {
            taskList.insertBefore(dragging, afterElement);
        }
    }

    function handleDrop(e) {
        const dragging = document.querySelector('.dragging');
        if (dragging) {
            dragging.classList.remove('dragging');
            updateTaskOrder();
        }
    }

    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('li:not(.dragging)')];
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    function updateTaskOrder() {
        const reorderedTasks = [];
        taskList.querySelectorAll('li').forEach(li => {
            const taskId = li.getAttribute('data-id');
            const task = tasks.find(t => t.id == taskId);
            reorderedTasks.push(task);
        });
        tasks = reorderedTasks;
        saveTasks();
    }

    function renderTasks() {
        const filter = document.querySelector('.filter-btn.active').getAttribute('data-filter');
        taskList.innerHTML = '';

        tasks.filter(task => {
            if (filter === 'all') return true;
            if (filter === 'active') return !task.completed;
            if (filter === 'completed') return task.completed;
        }).forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.priority === 'low' ? 'priority-low' : task.priority === 'medium' ? 'priority-medium' : 'priority-high'} ${task.completed ? 'completed' : ''}`;
            li.setAttribute('data-id', task.id);
            li.draggable = true;

            const taskInfo = document.createElement('div');
            taskInfo.className = 'task-info';

            const taskText = document.createElement('span');
            taskText.className = 'task-text';
            taskText.textContent = task.text;

            const taskDueDate = document.createElement('small');
            taskDueDate.textContent = task.dueDate ? `Due: ${task.dueDate}` : 'No due date';

            taskInfo.appendChild(taskText);
            taskInfo.appendChild(taskDueDate);

            const editBtn = document.createElement('button');
            editBtn.className = 'task-btn edit';
            editBtn.innerHTML = '<i class="fas fa-edit"></i>';

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'task-btn delete';
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';

            li.appendChild(taskInfo);
            li.appendChild(editBtn);
            li.appendChild(deleteBtn);
            taskList.appendChild(li);
        });
    }

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
});
