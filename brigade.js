const STORAGE_KEYS = {
  BRIGADES: 'vodadonbass_brigades',
  TASKS: 'vodadonbass_tasks',
  CHATS: 'vodadonbass_chats',
  CURRENT_USER: 'vodadonbass_current_user',
  CURRENT_BRIGADE: 'vodadonbass_current_brigade'
};

let currentBrigade = null;
let tasks = [];
let chats = [];
let selectedTaskId = null;

function init() {
  loadData();
  checkBrigade();
  renderTasks();
  renderBrigadeInfo();
  checkNewMessages();
  simulateIncomingSms();
}

function loadData() {
  const storedTasks = localStorage.getItem(STORAGE_KEYS.TASKS);
  const storedChats = localStorage.getItem(STORAGE_KEYS.CHATS);
  
  tasks = storedTasks ? JSON.parse(storedTasks) : [];
  chats = storedChats ? JSON.parse(storedChats) : [];
  
  let brigadeId = localStorage.getItem(STORAGE_KEYS.CURRENT_BRIGADE);
  
  if (!brigadeId) {
    brigadeId = getBrigadeIdFromUrl();
  }
  
  if (brigadeId) {
    const storedBrigades = localStorage.getItem(STORAGE_KEYS.BRIGADES);
    const brigades = storedBrigades ? JSON.parse(storedBrigades) : [];
    currentBrigade = brigades.find(b => b.id === brigadeId);
  }
  
  if (!currentBrigade) {
    const storedBrigades = localStorage.getItem(STORAGE_KEYS.BRIGADES);
    const brigades = storedBrigades ? JSON.parse(storedBrigades) : [];
    currentBrigade = brigades[0];
  }
}

function getBrigadeIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('brigade');
}

function saveData() {
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(chats));
}

function checkBrigade() {
  if (!currentBrigade) {
    document.body.innerHTML = '<div style="padding:20px;text-align:center">Бригада не найдена</div>';
  }
}

function renderBrigadeInfo() {
  document.getElementById('currentBrigadeName').textContent = currentBrigade.name;
  
  const statusEl = document.getElementById('brigadeStatus');
  const statusLabels = { free: 'Свободен', working: 'В работе', break: 'На перерыве', offline: 'Не работает' };
  statusEl.textContent = statusLabels[currentBrigade.status] || 'В работе';
  
  document.getElementById('shiftTime').textContent = `${currentBrigade.shiftStart} - ${currentBrigade.shiftEnd}`;
  
  const membersList = document.getElementById('membersList');
  membersList.innerHTML = currentBrigade.members.map(member => {
    const initials = member.split(' ').map(n => n[0]).join('');
    return `
      <div class="member-item">
        <div class="member-avatar">${initials}</div>
        <span>${member}</span>
      </div>
    `;
  }).join('');
}

function renderTasks() {
  const container = document.getElementById('tasksList');
  const brigadeTasks = tasks.filter(t => t.brigadeId === currentBrigade.id);
  
  if (brigadeTasks.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>Нет задач</p></div>';
    return;
  }
  
  const priorityLabels = { low: 'Низкий', medium: 'Средний', high: 'Высокий', emergency: 'Аварийный' };
  const statusLabels = { new: 'Новая', in_progress: 'В работе', completed: 'Выполнена', problem: 'Проблема', cancelled: 'Отменена' };
  
  container.innerHTML = brigadeTasks.map(task => `
    <div class="task-card" onclick="openTaskDetail('${task.id}')">
      <div class="task-card-header">
        <div class="task-card-title">${task.title}</div>
        <span class="priority-badge ${task.priority}">${priorityLabels[task.priority]}</span>
      </div>
      <div class="task-card-address">${task.address}</div>
      <span class="task-card-status ${task.status}">${statusLabels[task.status]}</span>
      ${task.photos && task.photos.length > 0 ? `
        <div class="task-card-photos">
          ${task.photos.map(p => `<img src="${p}" alt="Фото">`).join('')}
        </div>
      ` : ''}
    </div>
  `).join('');
}

function switchTab(tabName) {
  document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
  
  document.querySelector(`.tab[data-tab="${tabName}"]`).classList.add('active');
  document.getElementById(tabName + 'Tab').classList.add('active');
}

function openTaskDetail(taskId) {
  selectedTaskId = taskId;
  const task = tasks.find(t => t.id === taskId);
  
  document.getElementById('taskDetailTitle').textContent = task.title;
  document.getElementById('taskDetailAddress').textContent = task.address;
  document.getElementById('taskDetailDesc').textContent = task.description || 'Нет описания';
  
  const priorityEl = document.getElementById('taskDetailPriority');
  const priorityLabels = { low: 'Низкий', medium: 'Средний', high: 'Высокий', emergency: 'Аварийный' };
  priorityEl.textContent = priorityLabels[task.priority];
  priorityEl.className = 'priority-badge ' + task.priority;
  
  document.getElementById('taskStatusSelect').value = task.status;
  
  renderTaskPhotos(task);
  
  document.getElementById('taskDetailModal').classList.add('show');
}

function closeTaskDetail() {
  document.getElementById('taskDetailModal').classList.remove('show');
  selectedTaskId = null;
}

function renderTaskPhotos(task) {
  const container = document.getElementById('taskPhotos');
  let html = '';
  
  if (task.photos && task.photos.length > 0) {
    task.photos.forEach(photo => {
      html += `<img src="${photo}" alt="Фото">`;
    });
  }
  
  html += '<button class="add-photo-btn" onclick="addPhoto()">+</button>';
  container.innerHTML = html;
}

function addPhoto() {
  document.getElementById('photoInput').click();
}

function handlePhotoUpload() {
  const input = document.getElementById('photoInput');
  const files = Array.from(input.files);
  
  if (!selectedTaskId) return;
  
  const taskIndex = tasks.findIndex(t => t.id === selectedTaskId);
  if (taskIndex === -1) return;
  
  if (!tasks[taskIndex].photos) {
    tasks[taskIndex].photos = [];
  }
  
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = function(e) {
      tasks[taskIndex].photos.push(e.target.result);
      saveData();
      renderTaskPhotos(tasks[taskIndex]);
    };
    reader.readAsDataURL(file);
  });
  
  input.value = '';
}

function updateTaskStatus() {
  if (!selectedTaskId) return;
  
  const newStatus = document.getElementById('taskStatusSelect').value;
  const taskIndex = tasks.findIndex(t => t.id === selectedTaskId);
  
  if (taskIndex !== -1) {
    tasks[taskIndex].status = newStatus;
    
    if (newStatus === 'in_progress' && !tasks[taskIndex].startedAt) {
      tasks[taskIndex].startedAt = new Date().toISOString();
    }
    
    if (newStatus === 'completed' && !tasks[taskIndex].completedAt) {
      tasks[taskIndex].completedAt = new Date().toISOString();
    }
    
    if (newStatus === 'problem') {
      sendSms(`Внимание! Бригада ${currentBrigade.name} сообщает о проблеме: ${tasks[taskIndex].title}`);
      
      addChatMessage('system', `Бригада сообщила о проблеме: ${tasks[taskIndex].title}`);
    }
    
    saveData();
    renderTasks();
  }
  
  closeTaskDetail();
}

function openChat() {
  renderChatMessages();
  document.getElementById('chatModal').classList.add('show');
}

function closeChat() {
  document.getElementById('chatModal').classList.remove('show');
}

function renderChatMessages() {
  const container = document.getElementById('chatMessages');
  
  if (chats.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>Нет сообщений</p></div>';
    return;
  }
  
  container.innerHTML = chats.map(msg => `
    <div class="chat-message ${msg.from === 'brigade' ? 'from-brigade' : 'from-dispatcher'}">
      ${msg.text}
      <div class="chat-message-time">${new Date(msg.timestamp).toLocaleTimeString('ru-RU')}</div>
    </div>
  `).join('');
  
  container.scrollTop = container.scrollHeight;
}

function sendMessage() {
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  
  if (!text) return;
  
  addChatMessage('brigade', text);
  input.value = '';
  
  setTimeout(() => {
    addChatMessage('dispatcher', 'Сообщение получено! Если нужна помощь - позвоните.');
  }, 2000);
}

function addChatMessage(from, text) {
  chats.push({
    id: generateId(),
    timestamp: new Date().toISOString(),
    from: from,
    text: text
  });
  
  saveData();
  
  if (document.getElementById('chatModal').classList.contains('show')) {
    renderChatMessages();
  }
  
  if (from === 'dispatcher') {
    updateChatBadge();
  }
}

function checkNewMessages() {
  const newCount = chats.filter(c => c.from === 'dispatcher').length;
  const badge = document.getElementById('chatBadge');
  
  if (newCount > 0) {
    badge.textContent = newCount;
    badge.classList.add('show');
  }
}

function updateChatBadge() {
  const badge = document.getElementById('chatBadge');
  badge.classList.add('show');
  badge.textContent = parseInt(badge.textContent || '0') + 1;
}

function simulateIncomingSms() {
  const messages = [
    'Новая задача: Ремонт трубы на ул. Ленина',
    'Внимание! Срочный вызов на ул. Пушкина',
    'Бригада, закончите текущую задачу и свяжитесь с диспетчером',
    'Проверьте состояние оборудования на выезде'
  ];
  
  setInterval(() => {
    if (Math.random() > 0.7) {
      const msg = messages[Math.floor(Math.random() * messages.length)];
      sendSms(msg);
    }
  }, 60000);
}

function sendSms(text) {
  const notification = document.getElementById('smsNotification');
  document.getElementById('smsText').textContent = text;
  notification.classList.add('show');
  
  setTimeout(() => {
    notification.classList.remove('show');
  }, 5000);
}

function logoutBrigade() {
  if (confirm('Выйти из аккаунта бригады?')) {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_BRIGADE);
    window.location.href = 'brigade-login.html';
  }
}

function generateId() {
  return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

document.addEventListener('DOMContentLoaded', init);