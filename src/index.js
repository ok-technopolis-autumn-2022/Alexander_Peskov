const form = document.querySelector('.main-controls__create-new');
const ul = document.querySelector('.todo-app__task-list');
const selectAllButton = document.querySelector('.todo-app__select-all');
const clearCompletedButton = document.querySelector('.clear-button');
const itemsCounterElement = document.querySelector('.items-left-count');
const switches = document.querySelector('.switches');

const TODOLIST_NAME = 'todolist';
const ITEMS_COUNTER_NAME = 'itemsCounter';

const FilterModes = {
    ALL: "All",
    ACTIVE: "Active",
    COMPLETED: "Completed"
}

var itemsCounter;
var filterMode;

window.onload = function() {
    //localStorage.clear();
    if (!localStorage.getItem(TODOLIST_NAME)) {
        var todolist = [];
        var itemsCount = 0;
        localStorage.setItem(TODOLIST_NAME, JSON.stringify(todolist));
        localStorage.setItem(ITEMS_COUNTER_NAME, JSON.stringify(itemsCount));
    }   

    var todolist = JSON.parse(localStorage.getItem(TODOLIST_NAME));
    var itemsCount = JSON.parse(localStorage.getItem(ITEMS_COUNTER_NAME));
    updateItemsCount(itemsCount);

    for (var i = 0; i < todolist.length; i++) {
        console.log(todolist[i]);
        ul.appendChild(createLi(todolist[i]));
    }
}

function addTask(e) {
    e.preventDefault();

    if (e.target.todoText.value == '') {
        return;
    }
    const task = createTask(e.target.todoText.value);
    ul.appendChild(createLi(task));

    var todolist = JSON.parse(localStorage.getItem(TODOLIST_NAME));
    todolist.push({
        id: task.id,
        desc: task.desc,
        checked: false
    })
    localStorage.setItem(TODOLIST_NAME, JSON.stringify(todolist));

    changeItemsCount(1);
    filter();
    this.reset();
}

form.addEventListener('submit', addTask);

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

    const changeStatus = () => {
        updateTaskStatusInLocalStorage(task.id, input.checked);
    };
    input.addEventListener('change', changeStatus);

    const deleteTask = () => {
        button.removeEventListener('click', deleteTask);
        input.removeEventListener('change', changeStatus);
        changeItemsCount(-1);
        deleteTaskFromLocalStorageById(task.id);
        li.remove();
    };
    button.addEventListener('click', deleteTask);

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

    var children = ul.children;
    var allChecked = true;
    for (var i = 0; i < children.length; i++) {
        var child = children[i];
        if (isActive(child)) {
            allChecked = false;
            break;
        }
    }
    allChecked = !allChecked;
    for (var i = 0; i < children.length; i++) {
        var child = children[i];
        updateTaskStatusInLocalStorage(child.id, allChecked);
        child.querySelector('.task-item__status').checked = allChecked;
    }
    filter();

}

selectAllButton.addEventListener('click', selectAll);

function clearCompleted(e) {
    e.preventDefault();
    if (filterMode == FilterModes.ACTIVE) {
        return;
    }
    var children = ul.children;
    var length = children.length;
    var deletedCounter = 0;
    for (var i = 0; i < length; i++) {
        var child = children[i];
        if (!isActive(child)) {
            var id = child.id;
            deleteTaskFromLocalStorageById(id);
            child.remove();
            deletedCounter++;
            i--;
            length--;
        }
    }
    changeItemsCount(-deletedCounter);
}

clearCompletedButton.addEventListener('click', clearCompleted);

function changeItemsCount(i) {
    updateItemsCount(itemsCounter + i);
}

function updateItemsCount(count) {
    itemsCounter = count;
    localStorage.setItem(ITEMS_COUNTER_NAME, JSON.stringify(itemsCounter));
    itemsCounterElement.children[0].textContent = itemsCounter + ' items left';
}

function deleteTaskFromLocalStorageById(id) {
    var todolist = JSON.parse(localStorage.getItem(TODOLIST_NAME));
    var index = todolist.findIndex(task => task.id == id);
    todolist.splice(index, 1);
    localStorage.setItem(TODOLIST_NAME, JSON.stringify(todolist));
}

function updateTaskStatusInLocalStorage(id, checked) {
    var todolist = JSON.parse(localStorage.getItem(TODOLIST_NAME));
    var index = todolist.findIndex(task => task.id == id);
    todolist[index].checked = checked;
    localStorage.setItem(TODOLIST_NAME, JSON.stringify(todolist));
    filter()
}

function isActive(task) {
    return !task.querySelector('.task-item__status').checked;
}

function updateFilterMode() {
    var children = switches.children;
    for (var i = 0; i < children.length; i++) {
        var child = children[i].querySelector('input');
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

function filter() {
    var showActive;
    var showCompleted;
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
    var children = ul.children;
    for (var i = 0; i < children.length; i++) {
        var child = children[i];
        if (isActive(child) == showActive ||
            isActive(child) != showCompleted) {
            child.style.display = "block";
        } else {
            child.style.display = "none";
        }
    }
}

switches.addEventListener('click', updateFilterMode);
