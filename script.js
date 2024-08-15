document.addEventListener('DOMContentLoaded', () => {
    openTab('allTasks');
    loadTasks();
    loadDeletedTasks();
    updateTrashCount(); 
});

function openTab(tabId) {
    // Tab'lar arasında geçiş yapmak için mevcut işlev
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
    });

    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.classList.remove('active');
    });

    document.getElementById(tabId).classList.add('active');
    const activeButton = Array.from(tabButtons).find(button => button.textContent.includes(tabId === 'allTasks' ? 'Tüm Görevler' : 'Tamamlanan Görevler'));
    if (activeButton) {
        activeButton.classList.add('active');
    }
}

// Enter tuşuna basıldığında görev ekle
document.getElementById('taskInput').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        addTask();
    }
});

function addTask() {
    const taskInput = document.getElementById('taskInput');
    const taskText = taskInput.value.trim();

    if (taskText === '') {
        showNotification('Lütfen bir görev girin.', 'error');
        return;
    }

    const taskList = document.getElementById('taskList');
    const li = document.createElement('li');

    li.innerHTML = `${taskText} 
        <button onclick="completeTask(this)"><i class="fa-solid fa-check"></i> Tamamla</button>`;
    taskList.appendChild(li);

    taskInput.value = '';
    showNotification('Görev başarıyla eklendi.', 'success');
    saveTasks();
}


function completeTask(button) {
    const li = button.parentElement;
    const taskText = li.textContent.replace('Tamamla', '').trim();

    const completedTasks = document.getElementById('completedTasksList');
    const completedLi = document.createElement('li');
    completedLi.innerHTML = `${taskText} 
        <button onclick="removeTask(this)"><i class="fa-solid fa-trash"></i> Sil</button>`;
    completedTasks.appendChild(completedLi);

    li.remove();
    updateTrashCount(); // Çöp kutusu sayısını güncelle
    showNotification('Görev başarıyla tamamlandı.', 'success');
    saveTasks();
}

function removeTask(button) {
    const li = button.parentElement;
    const taskText = li.textContent.replace('Sil', '').trim();

    const deletedTasksList = document.getElementById('deletedTasksList');
    const deletedLi = document.createElement('li');
    deletedLi.innerHTML = `<i class="fa-solid fa-trash"></i> ${taskText}`;
    deletedTasksList.appendChild(deletedLi);

    // Yerel depolamayı güncelle
    let deletedTasks = JSON.parse(localStorage.getItem('deletedTasks')) || [];
    deletedTasks.push(taskText);
    localStorage.setItem('deletedTasks', JSON.stringify(deletedTasks));

    updateTrashCount();
    li.remove();
    showNotification('Görev başarıyla silindi.', 'success');
    saveTasks();
}

function toggleTrashPanel() {
    const trashPanel = document.getElementById('trashPanel');
    const tabs = document.querySelector('.tabs');
    const tabContents = document.querySelectorAll('.tab-content');
    
    if (trashPanel.style.display === 'none' || trashPanel.style.display === '') {
        trashPanel.style.display = 'block';
        tabs.style.display = 'none'; 
        tabContents.forEach(content => {
            content.style.display = 'none'; 
        });
    } else {
        trashPanel.style.display = 'none';
        tabs.style.display = 'block'; 
        tabContents.forEach(content => {
            content.style.display = 'block'; 
        });
    }
}

// Silinen görevler panelini göster
document.getElementById('showTrashPanelButton').addEventListener('click', () => {
    toggleTrashPanel();
});

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type} show`;
    notification.innerHTML = `
        <span class="icon"><i class="fa-solid fa-${type === 'success' ? 'check' : 'times'}"></i></span>
        <span class="message">${message}</span>
        <button class="close" onclick="this.parentElement.remove()"><i class="fa-solid fa-xmark"></i></button>
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

function loadTasks() {
    const taskList = document.getElementById('taskList');
    const completedTasksList = document.getElementById('completedTasksList');
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.forEach(task => {
        const li = document.createElement('li');
        if (task.completed) {
            li.innerHTML = `${task.text} 
                <button onclick="removeTask(this)"><i class="fa-solid fa-trash"></i> Sil</button>`;
            completedTasksList.appendChild(li);
        } else {
            li.innerHTML = `${task.text} 
                <button onclick="completeTask(this)"><i class="fa-solid fa-check"></i> Tamamla</button>`;
            taskList.appendChild(li);
        }
    });
}

// Silinen görevler yerel depolamadan yükleme
function loadDeletedTasks() {
    const deletedTasksList = document.getElementById('deletedTasksList');
    const deletedTasks = JSON.parse(localStorage.getItem('deletedTasks')) || [];
    deletedTasks.forEach(taskText => {
        const taskItem = document.createElement('li');
        taskItem.innerHTML = `<i class="fa-solid fa-trash"></i> ${taskText}`;
        deletedTasksList.appendChild(taskItem);
    });
    updateTrashCount(); 
}

// Tüm silinen görevleri temizleme fonksiyonu
function clearAllDeletedTasks() {
    const deletedTasksList = document.getElementById('deletedTasksList');
    deletedTasksList.innerHTML = ''; 

    localStorage.removeItem('deletedTasks');
    updateTrashCount(); 
    location.reload();
}

// Görevleri yerel depolamaya kaydetme
function saveTasks() {
    const taskList = document.getElementById('taskList');
    const completedTasksList = document.getElementById('completedTasksList');

    const tasks = Array.from(taskList.children).map(task => ({
        text: task.textContent.replace('Tamamla', '').trim(),
        completed: false
    }));
    tasks.push(...Array.from(completedTasksList.children).map(task => ({
        text: task.textContent.replace('Sil', '').trim(),
        completed: true
    })));

    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function updateTrashCount() {
    const deletedTasksList = document.getElementById('deletedTasksList');
    document.getElementById('trashCount').textContent = deletedTasksList.children.length;
}
