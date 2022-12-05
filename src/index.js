const form = document.querySelector('.main-controls__create-new');
const ul = document.querySelector('.todo-app__task-list');
const selectAllButton = document.querySelector('.todo-app__select-all');
const clearCompletedButton = document.querySelector('.clear-button');
const itemsCounterElement = document.querySelector('.items-left-count');
const switches = document.querySelector('.switches');

const TODOLIST_NAME = 'todolist';
const HIDDEN = "hidden";
const SHOWN = "shown";

const FilterModes = {
    ALL: "All",
    ACTIVE: "Active",
    COMPLETED: "Completed"
}

let filterMode;

if (!localStorage.getItem(TODOLIST_NAME)) {
    let todolist = [];
    setTodolistInLocalStorage(todolist);
}   

let todolist = getTodolostFromLocalStorage();
updateItemsCount(todolist);
renderTodolist(todolist);

function addTask(e) {
    e.preventDefault();
    const text = e.target.todoText.value.trim();
    if (text === '') {
        return;
    }
    const task = createTask(text);

    let todolist = getTodolostFromLocalStorage();
    todolist.push({
        id: task.id,
        desc: task.desc,
        checked: false
    })
    setTodolistInLocalStorage(todolist);
    renderTask(task)

    filter();
    this.reset();
}
form.addEventListener('submit', addTask);

function renderTodolist(todolist) {
    for (let i = 0; i < todolist.length; i++) {
        renderTask(todolist[i]);
    }
}

function renderTask(task) {
    ul.appendChild(createLi(task));
}

function createLi(task) {
    const li = document.createElement('li');
    li.id = task.id;
    li.className = 'todo-app__task-item';

    const itemView = document.createElement('div');
    itemView.className = 'task-item__view';

    const input = document.createElement('input');
    input.id = task.id;
    input.type = 'checkbox';
    input.checked = task.checked;
    input.className = 'task-item__status';
    input.ariaLabel = 'Task: ' + task.desc;

    const span = document.createElement('span');
    span.className = 'task-item__text';
    span.textContent = task.desc;

    const label = document.createElement('label');
    label.htmlFor = task.id;
    label.className = 'task-item__status-text';

    const button = document.createElement('button');
    button.className = 'delete-task'

    label.append(input, span);
    itemView.append(label, button);
    li.appendChild(itemView);

    return li;
}

function createTask(desc) {
    return {
        id: Date.now(),
        desc: desc
    }
}

function selectAll(e) {
    e.preventDefault();

    let children = ul.children;
    const allChecked = [...children].some(child => isActive(child));
    for (let i = 0; i < children.length; i++) {
        let child = children[i];
        setTaskStatusInLocalStorage(child.id, allChecked);
        child.querySelector('.task-item__status').checked = allChecked;
    }
    filter();
}
selectAllButton.addEventListener('click', selectAll);

function clearCompleted(e) {
    e.preventDefault();
    if (filterMode === FilterModes.ACTIVE) {
        return;
    }
    let children = ul.children;
    let length = children.length;
    while (length--) {
        let child = children[length];
        if (!isActive(child)) {
            deleteTaskFromLocalStorageById(child.id);
            child.remove();
        }
    }
}
clearCompletedButton.addEventListener('click', clearCompleted);

function deleteTask(e) {
    target = e.target;
    if (target.className !== 'delete-task') {
        return;
    }
    const li = target.parentNode.parentNode;
    const id = li.id;
    li.remove();
    deleteTaskFromLocalStorageById(id);
}
ul.addEventListener('click', deleteTask);

function deleteTaskFromLocalStorageById(id) {
    let todolist = getTodolostFromLocalStorage();
    let index = todolist.findIndex(task => task.id === id);
    todolist.splice(index, 1);
    setTodolistInLocalStorage(todolist);
}

function changeTaskStatus(e) {
    target = e.target;
    if (target.className !== 'task-item__status') {
        return;
    }
    const id = target.id;
    const checked = target.checked;
    setTaskStatusInLocalStorage(id, checked);
}
ul.addEventListener('click', changeTaskStatus);

function setTaskStatusInLocalStorage(id, checked) {
    let todolist = getTodolostFromLocalStorage();
    let index = todolist.findIndex(task => task.id === id);
    todolist[index].checked = checked;
    setTodolistInLocalStorage(todolist);
    filter();
}

function getTodolostFromLocalStorage() {
    return JSON.parse(localStorage.getItem(TODOLIST_NAME));
}

function setTodolistInLocalStorage(todolist) {
    localStorage.setItem(TODOLIST_NAME, JSON.stringify(todolist));
    updateItemsCount(todolist);
}

function updateItemsCount(todolist) {
    const count = todolist.filter(task => !task.checked).length;
    itemsCounterElement.children[0].textContent = count + ' items left';
}

function isActive(task) {
    return !task.querySelector('.task-item__status').checked;
}

function updateFilterMode() {
    let children = switches.children;
    for (let i = 0; i < children.length; i++) {
        let child = children[i].querySelector('input');
        if (child.checked) {
            switch (child.id) {
                case "all":
                    filterMode = FilterModes.ALL;
                    break
                case "active":
                    filterMode = FilterModes.ACTIVE;
                    break
                case "completed":
                    filterMode = FilterModes.COMPLETED;
                    break
            }
        }
    }
    filter();
}
switches.addEventListener('click', updateFilterMode);

function filter() {
    let showActive;
    let showCompleted;
    switch (filterMode) {
        case FilterModes.ALL:
            showActive = true;
            showCompleted = true;
            break;
        case FilterModes.ACTIVE:
            showActive = true;
            showCompleted = false;
            break;
        case FilterModes.COMPLETED:
            showActive = false;
            showCompleted = true;
            break;
    }
    let children = ul.children;
    for (let i = 0; i < children.length; i++) {
        let child = children[i];
        if (isActive(child) === showActive ||
            isActive(child) !== showCompleted) {
            child.classList.remove(HIDDEN);
            child.classList.add(SHOWN);
        } else {
            child.classList.remove(SHOWN);
            child.classList.add(HIDDEN);
        }
    }
}
