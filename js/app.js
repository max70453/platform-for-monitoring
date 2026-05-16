const STORAGE_KEYS = {
  BRIGADES: 'vodadonbass_brigades',
  TASKS: 'vodadonbass_tasks',
  WORKTIME: 'vodadonbass_worktime',
  CURRENT_USER: 'vodadonbass_current_user',
  HISTORY: 'vodadonbass_history',
  TEMPLATES: 'vodadonbass_templates',
  NOTIFICATIONS: 'vodadonbass_notifications',
  CHATS: 'vodadonbass_chats'
};

let brigades = [];
let tasks = [];
let workTimeRecords = [];
let historyLog = [];
let taskTemplates = [];
let chats = [];
let currentUser = null;
let breakRemindersInterval = null;

window.resetDemoData = function() {
  localStorage.removeItem('vodadonbass_brigades');
  localStorage.removeItem('vodadonbass_tasks');
  localStorage.removeItem('vodadonbass_worktime');
  localStorage.removeItem('vodadonbass_history');
  localStorage.removeItem('vodadonbass_templates');
  localStorage.removeItem('vodadonbass_current_user');
  
  const defaultUser = {
    id: 'user_admin',
    fullName: 'Администратор',
    role: 'admin',
    login: 'admin',
    password: 'admin123',
    createdAt: new Date().toISOString()
  };
  localStorage.setItem('vodadonbass_current_user', JSON.stringify(defaultUser));
  localStorage.setItem('vodadonbass_users', JSON.stringify([defaultUser]));
  
  brigades = [];
  tasks = [];
  workTimeRecords = [];
  historyLog = [];
  taskTemplates = [];
  
  generateSampleData();
  
  alert('Данные перегенерированы! Перезагрузка...');
  location.reload();
};

function init() {
  checkAuth();
  loadData();
  setupNavigation();
  setupEventListeners();
  updateClock();
  setInterval(updateClock, 1000);
  renderDashboard();
  initNotifications();
  startBreakReminders();
  registerServiceWorker();
}

function checkAuth() {
  const userStr = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  if (!userStr) {
    window.location.href = 'login.html';
    return;
  }
  currentUser = JSON.parse(userStr);
  renderUserInfo();
}

function renderUserInfo() {
  const headerInfo = document.querySelector('.header-info');
  const userBadge = document.createElement('div');
  userBadge.className = 'user-badge';
  userBadge.innerHTML = `
    <span class="user-name">${currentUser.fullName}</span>
    <span class="user-role">${getRoleLabel(currentUser.role)}</span>
    <button class="btn-logout" onclick="logout()" title="Выйти">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
      </svg>
    </button>
  `;
  headerInfo.appendChild(userBadge);
}

function getRoleLabel(role) {
  const labels = {
    dispatcher: 'Диспетчер',
    brigade_leader: 'Бригадир',
    worker: 'Рабочий',
    admin: 'Администратор'
  };
  return labels[role] || role;
}

function logout() {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  window.location.href = 'login.html';
}

function loadData() {
  const storedBrigades = localStorage.getItem(STORAGE_KEYS.BRIGADES);
  const storedTasks = localStorage.getItem(STORAGE_KEYS.TASKS);
  const storedWorkTime = localStorage.getItem(STORAGE_KEYS.WORKTIME);
  const storedHistory = localStorage.getItem(STORAGE_KEYS.HISTORY);
  const storedTemplates = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
  const storedChats = localStorage.getItem(STORAGE_KEYS.CHATS);

  brigades = storedBrigades ? JSON.parse(storedBrigades) : [];
  tasks = storedTasks ? JSON.parse(storedTasks) : [];
  workTimeRecords = storedWorkTime ? JSON.parse(storedWorkTime) : [];
  historyLog = storedHistory ? JSON.parse(storedHistory) : [];
  taskTemplates = storedTemplates ? JSON.parse(storedTemplates) : [];
  chats = storedChats ? JSON.parse(storedChats) : [];

  if (brigades.length === 0) {
    generateSampleData();
  }

  if (taskTemplates.length === 0) {
    generateDefaultTemplates();
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEYS.BRIGADES, JSON.stringify(brigades));
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  localStorage.setItem(STORAGE_KEYS.WORKTIME, JSON.stringify(workTimeRecords));
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(historyLog));
  localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(taskTemplates));
  localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(chats));
}

function addHistory(action, entity, entityId, details) {
  historyLog.push({
    id: generateId(),
    timestamp: new Date().toISOString(),
    userId: currentUser.id,
    userName: currentUser.fullName,
    action,
    entity,
    entityId,
    details
  });
  saveData();
}

function generateDefaultTemplates() {
  taskTemplates = [
    { id: generateId(), title: 'Ремонт трубопровода', description: 'Плановый ремонт труб', address: '', priority: 'medium' },
    { id: generateId(), title: 'Замена задвижки', description: 'Замена аварийной задвижки', address: '', priority: 'high' },
    { id: generateId(), title: 'Профилактический осмотр', description: 'Плановый осмотр оборудования', address: '', priority: 'low' },
    { id: generateId(), title: 'Устранение утечки', description: 'Срочное устранение утечки воды', address: '', priority: 'emergency' },
    { id: generateId(), title: 'Монтаж водосчетчика', description: 'Установка и опломбирование водосчетчика', address: '', priority: 'medium' }
  ];
  saveData();
}

function generateSampleData() {
  brigades = [
    { id: generateId(), name: 'Бригада №1', members: ['Иванов И.И.', 'Петров А.С.', 'Сидоров В.Н.'], phone: '+7-949-123-45-67', shiftStart: '08:00', shiftEnd: '20:00', status: 'working', lastBreak: null },
    { id: generateId(), name: 'Бригада №2', members: ['Козлов Д.М.', 'Михайлов С.П.'], phone: '+7-949-234-56-78', shiftStart: '08:00', shiftEnd: '20:00', status: 'free', lastBreak: null },
    { id: generateId(), name: 'Бригада №3', members: ['Смирнов К.Л.', 'Волков Е.О.', 'Новиков Р.Т.'], phone: '+7-949-345-67-89', shiftStart: '20:00', shiftEnd: '08:00', status: 'break', lastBreak: null }
  ];

  const b1 = brigades[0].id;
  const b2 = brigades[1].id;
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  tasks = [
    { id: generateId(), title: 'Ремонт водопровода', description: 'Устранение утечки на магистральной трубе', address: 'ул. Артема, 45', priority: 'emergency', brigadeId: b1, status: 'in_progress', createdAt: `${todayStr}T07:30:00`, startedAt: `${todayStr}T08:15:00`, completedAt: null, photos: [] },
    { id: generateId(), title: 'Замена задвижки', description: 'Заменить аварийную задвижку на колодце', address: 'пр. Гурова, 12', priority: 'high', brigadeId: b1, status: 'new', createdAt: `${todayStr}T09:00:00`, startedAt: null, completedAt: null, photos: [] },
    { id: generateId(), title: 'Профилактический осмотр', description: 'Плановый осмотр оборудования', address: 'ул. Ленина, 78', priority: 'low', brigadeId: b2, status: 'completed', createdAt: `${todayStr}T06:00:00`, startedAt: `${todayStr}T08:30:00`, completedAt: `${todayStr}T10:45:00`, photos: [] },
    { id: generateId(), title: 'Восстановление водоснабжения', description: 'После аварии на сетях', address: 'ул. Комсомольская, 23', priority: 'emergency', brigadeId: null, status: 'new', createdAt: `${todayStr}T10:30:00`, startedAt: null, completedAt: null, photos: [] }
  ];

  const pastTasks = [];
  const taskCounts = [3, 1, 5, 2, 4, 6];
  const taskTitles = ['Ремонт трубы', 'Замена насоса', 'Осмотр колодца', 'Устранение утечки', 'Монтаж счетчика'];
  
  for (let i = 1; i <= 6; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const taskCount = taskCounts[i - 1];
    
    for (let j = 0; j < taskCount; j++) {
      pastTasks.push({
        id: generateId(),
        title: taskTitles[j % taskTitles.length],
        description: 'Плановое задание',
        address: `ул. Пушкина, ${j + 1}`,
        priority: ['low', 'medium', 'high'][j % 3],
        brigadeId: j % 2 === 0 ? b1 : b2,
        status: 'completed',
        createdAt: `${dateStr}T08:00:00`,
        startedAt: `${dateStr}T08:30:00`,
        completedAt: `${dateStr}T${10 + (j % 5)}:30:00`,
        photos: []
      });
    }
  }
  tasks = [...tasks, ...pastTasks];

  workTimeRecords = [
    { id: generateId(), brigadeId: b1, date: todayStr, startTime: '08:00', endTime: '12:30', breaks: [{ start: '10:00', end: '10:30' }], totalHours: 4 },
    { id: generateId(), brigadeId: b2, date: todayStr, startTime: '08:00', endTime: '11:00', breaks: [], totalHours: 3 }
  ];

  const pastWorkTime = [];
  const hourCounts = [17, 8, 15, 12, 16, 14];
  
  for (let i = 1; i <= 6; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const hours = hourCounts[i - 1];
    const endHour = 8 + hours;
    
    pastWorkTime.push({
      id: generateId(),
      brigadeId: b1,
      date: dateStr,
      startTime: '08:00',
      endTime: `${endHour}:00`,
      breaks: hours > 8 ? [{ start: '10:00', end: '10:30' }] : [],
      totalHours: hours - (hours > 8 ? 0 : 0)
    });
    
    pastWorkTime.push({
      id: generateId(),
      brigadeId: b2,
      date: dateStr,
      startTime: '08:00',
      endTime: `${endHour - 1}:00`,
      breaks: [],
      totalHours: hours - 1
    });
  }
  workTimeRecords = [...workTimeRecords, ...pastWorkTime];

  historyLog = [
    { id: generateId(), timestamp: new Date().toISOString(), userId: 'user_admin', userName: 'Администратор', action: 'create', entity: 'задача', entityId: null, details: 'Ремонт водопровода' },
    { id: generateId(), timestamp: new Date(Date.now() - 3600000).toISOString(), userId: 'user_admin', userName: 'Администратор', action: 'create', entity: 'задача', entityId: null, details: 'Замена задвижки' },
    { id: generateId(), timestamp: new Date(Date.now() - 7200000).toISOString(), userId: 'user_admin', userName: 'Администратор', action: 'status_change', entity: 'задача', entityId: null, details: 'Профилактический осмотр → Выполнена' },
    { id: generateId(), timestamp: new Date(Date.now() - 86400000).toISOString(), userId: 'user_admin', userName: 'Администратор', action: 'update', entity: 'бригада', entityId: null, details: 'Бригада №1' },
    { id: generateId(), timestamp: new Date(Date.now() - 172800000).toISOString(), userId: 'user_admin', userName: 'Администратор', action: 'create', entity: 'задача', entityId: null, details: 'Устранение утечки' },
    { id: generateId(), timestamp: new Date(Date.now() - 259200000).toISOString(), userId: 'user_admin', userName: 'Администратор', action: 'delete', entity: 'задача', entityId: null, details: 'Старая задача' },
    { id: generateId(), timestamp: new Date(Date.now() - 345600000).toISOString(), userId: 'user_admin', userName: 'Администратор', action: 'create', entity: 'бригада', entityId: null, details: 'Бригада №3' }
  ];

  saveData();
}

function generateId() {
  return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const views = document.querySelectorAll('.view');
  const pageTitle = document.getElementById('pageTitle');

  const titles = {
    dashboard: 'Дашборд',
    brigades: 'Бригады',
    tasks: 'Задачи',
    calendar: 'Календарь',
    reports: 'Отчеты',
    history: 'История',
    templates: 'Шаблоны',
    chat: 'Чат'
  };

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const viewName = item.dataset.view;

      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');

      views.forEach(view => view.classList.remove('active'));
      document.getElementById(viewName + 'View').classList.add('active');

      pageTitle.textContent = titles[viewName];

      renderView(viewName);

      if (window.innerWidth <= 768) {
        document.getElementById('sidebar').classList.remove('open');
      }
    });
  });
}

function setupEventListeners() {
  document.getElementById('menuToggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
  });

  document.getElementById('brigadeForm').addEventListener('submit', handleBrigadeSubmit);
  document.getElementById('taskForm').addEventListener('submit', handleTaskSubmit);
  document.getElementById('templateForm').addEventListener('submit', handleTemplateSubmit);

  document.getElementById('taskStatusFilter').addEventListener('change', renderTasksTable);
  document.getElementById('taskPriorityFilter').addEventListener('change', renderTasksTable);
}

function renderView(viewName) {
  switch (viewName) {
    case 'brigades':
      renderBrigadesList();
      break;
    case 'tasks':
      renderTasksTable();
      break;
    case 'calendar':
      renderCalendar();
      break;
    case 'reports':
      renderReports();
      break;
    case 'history':
      renderHistory();
      break;
    case 'templates':
      renderTemplates();
      break;
    case 'chat':
      renderChat();
      break;
  }
}

function updateClock() {
  const now = new Date();
  const timeEl = document.getElementById('currentTime');
  const dateEl = document.getElementById('currentDate');

  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  timeEl.textContent = `${hours}:${minutes}:${seconds}`;

  const options = { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' };
  dateEl.textContent = now.toLocaleDateString('ru-RU', options);
}

function renderDashboard() {
  document.getElementById('totalBrigades').textContent = brigades.length;
  document.getElementById('totalTasks').textContent = tasks.length;

  const totalHours = workTimeRecords.reduce((sum, record) => sum + (record.totalHours || 0), 0);
  document.getElementById('totalHours').textContent = totalHours.toFixed(1) + 'ч';

  const emergencyCount = tasks.filter(t => t.priority === 'emergency').length;
  document.getElementById('emergencyTasks').textContent = emergencyCount;

  renderBrigadesOnShift();
  renderActiveTasks();
}

function renderBrigadesOnShift() {
  const container = document.getElementById('brigadesOnShift');

  if (brigades.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>Нет бригад</p></div>';
    return;
  }

  const statusLabels = { free: 'Свободен', working: 'В работе', break: 'На перерыве', offline: 'Не работает' };

  container.innerHTML = brigades.map(brigade => `
    <div class="brigade-mini">
      <div class="brigade-mini-info">
        <div class="brigade-mini-name">${brigade.name}</div>
        <div class="brigade-mini-meta">${brigade.members.length} чел. | ${brigade.shiftStart} - ${brigade.shiftEnd}</div>
      </div>
      <span class="brigade-status ${brigade.status}">${statusLabels[brigade.status]}</span>
    </div>
  `).join('');
}

function renderActiveTasks() {
  const container = document.getElementById('activeTasks');
  const activeTasks = tasks.filter(t => t.status === 'new' || t.status === 'in_progress');

  if (activeTasks.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>Нет активных задач</p></div>';
    return;
  }

  const statusLabels = { new: 'Новая', in_progress: 'В работе' };

  container.innerHTML = activeTasks.map(task => {
    const brigade = brigades.find(b => b.id === task.brigadeId);
    return `
      <div class="task-mini">
        <div class="task-mini-priority ${task.priority}"></div>
        <div class="task-mini-info">
          <div class="task-mini-title">${task.title}</div>
          <div class="task-mini-meta">${task.address} ${brigade ? '| ' + brigade.name : ''}</div>
        </div>
        <span class="task-mini-status ${task.status}">${statusLabels[task.status]}</span>
      </div>
    `;
  }).join('');
}

function renderBrigadesList() {
  const container = document.getElementById('brigadesList');

  if (brigades.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>Нет бригад. Добавьте первую бригаду.</p></div>';
    return;
  }

  const statusLabels = { free: 'Свободен', working: 'В работе', break: 'На перерыве', offline: 'Не работает' };

  container.innerHTML = brigades.map(brigade => `
    <div class="brigade-card">
      <div class="brigade-card-header">
        <div>
          <div class="brigade-name">${brigade.name}</div>
        </div>
        <span class="brigade-status ${brigade.status}">${statusLabels[brigade.status]}</span>
      </div>
      <div class="brigade-info">
        <div class="brigade-info-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <span>${brigade.members.join(', ')}</span>
        </div>
        <div class="brigade-info-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.58 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          <span>${brigade.phone}</span>
        </div>
        <div class="brigade-info-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          <span>Смена: ${brigade.shiftStart} - ${brigade.shiftEnd}</span>
        </div>
      </div>
      <div class="brigade-actions">
        <button class="btn btn-sm btn-secondary" onclick="editBrigade('${brigade.id}')">Редактировать</button>
        <button class="btn btn-sm btn-danger" onclick="deleteBrigade('${brigade.id}')">Удалить</button>
      </div>
    </div>
  `).join('');
}

function renderTasksTable() {
  const container = document.getElementById('tasksTableBody');
  const statusFilter = document.getElementById('taskStatusFilter').value;
  const priorityFilter = document.getElementById('taskPriorityFilter').value;

  let filteredTasks = [...tasks];

  if (statusFilter !== 'all') filteredTasks = filteredTasks.filter(t => t.status === statusFilter);
  if (priorityFilter !== 'all') filteredTasks = filteredTasks.filter(t => t.priority === priorityFilter);

  filteredTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (filteredTasks.length === 0) {
    container.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px;">Нет задач</td></tr>';
    return;
  }

  const priorityLabels = { low: 'Низкий', medium: 'Средний', high: 'Высокий', emergency: 'Аварийный' };
  const statusLabels = { new: 'Новая', in_progress: 'В работе', completed: 'Выполнена', cancelled: 'Отменена' };

  container.innerHTML = filteredTasks.map(task => {
    const brigade = brigades.find(b => b.id === task.brigadeId);
    const date = new Date(task.createdAt).toLocaleDateString('ru-RU');
    const hasPhotos = task.photos && task.photos.length > 0;

    return `
      <tr>
        <td>${date}</td>
        <td>
          <strong>${task.title}</strong>
          ${task.description ? `<br><small style="color: var(--text-secondary)">${task.description}</small>` : ''}
          ${hasPhotos ? '<br><small style="color: var(--secondary)">📷 Фото</small>' : ''}
        </td>
        <td>${brigade ? brigade.name : '-'}</td>
        <td>${task.address}</td>
        <td><span class="priority-badge ${task.priority}">${priorityLabels[task.priority]}</span></td>
        <td><span class="status-badge ${task.status}">${statusLabels[task.status]}</span></td>
        <td>
          <button class="btn-icon" onclick="editTask('${task.id}')" title="Редактировать">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="btn-icon" onclick="showTaskPhotos('${task.id}')" title="Фото">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          </button>
          <button class="btn-icon" onclick="deleteTask('${task.id}')" title="Удалить">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function renderCalendar() {
  const container = document.getElementById('calendarContainer');
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

  let calendarHTML = `
    <div class="calendar-header">
      <button class="btn btn-sm btn-secondary" onclick="changeMonth(-1)">←</button>
      <h3>${now.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}</h3>
      <button class="btn btn-sm btn-secondary" onclick="changeMonth(1)">→</button>
    </div>
    <div class="calendar-grid">
      <div class="calendar-day-header">Пн</div><div class="calendar-day-header">Вт</div><div class="calendar-day-header">Ср</div>
      <div class="calendar-day-header">Чт</div><div class="calendar-day-header">Пт</div><div class="calendar-day-header">Сб</div><div class="calendar-day-header">Вс</div>
  `;

  for (let i = 0; i < startDay; i++) {
    calendarHTML += '<div class="calendar-day empty"></div>';
  }

  for (let day = 1; day <= lastDay.getDate(); day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayTasks = tasks.filter(t => t.createdAt.startsWith(dateStr));
    const isToday = day === now.getDate();

    calendarHTML += `
      <div class="calendar-day ${isToday ? 'today' : ''}" onclick="showDayTasks('${dateStr}')">
        <div class="day-number">${day}</div>
        ${dayTasks.length > 0 ? `<div class="day-tasks-count">${dayTasks.length} задач</div>` : ''}
      </div>
    `;
  }

  calendarHTML += '</div>';
  container.innerHTML = calendarHTML;
}

function changeMonth(delta) {
  renderCalendar();
}

function showDayTasks(dateStr) {
  const dayTasks = tasks.filter(t => t.createdAt.startsWith(dateStr));
  alert(`Задачи на ${new Date(dateStr).toLocaleDateString('ru-RU')}:\n\n` + 
    (dayTasks.length ? dayTasks.map(t => `- ${t.title} (${t.status})`).join('\n') : 'Нет задач'));
}

function renderReports() {
  const today = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter(t => t.createdAt.startsWith(today));

  document.getElementById('reportTotalTasks').textContent = todayTasks.length;
  document.getElementById('reportCompletedTasks').textContent = todayTasks.filter(t => t.status === 'completed').length;
  document.getElementById('reportInProgressTasks').textContent = todayTasks.filter(t => t.status === 'in_progress').length;

  const todayWorkTime = workTimeRecords.filter(w => w.date === today);
  const totalHours = todayWorkTime.reduce((sum, w) => sum + w.totalHours, 0);
  document.getElementById('reportHours').textContent = totalHours.toFixed(1) + 'ч';

  const container = document.getElementById('brigadeEfficiency');

  if (brigades.length === 0) {
    container.innerHTML = '<p style="color: var(--text-secondary)">Нет данных о бригадах</p>';
    return;
  }

  container.innerHTML = brigades.map(brigade => {
    const brigadeTasks = tasks.filter(t => t.brigadeId === brigade.id && t.status === 'completed').length;
    const totalAssigned = tasks.filter(t => t.brigadeId === brigade.id).length;
    const efficiency = totalAssigned > 0 ? Math.round((brigadeTasks / totalAssigned) * 100) : 0;

    return `
      <div class="efficiency-item">
        <div class="efficiency-name">${brigade.name}</div>
        <div class="efficiency-bar"><div class="efficiency-fill" style="width: ${efficiency}%"></div></div>
        <div class="efficiency-percent">${efficiency}%</div>
      </div>
    `;
  }).join('');

  renderStatistics();
}

function renderStatistics() {
  const statsContainer = document.getElementById('statisticsContainer');
  const days = 7;
  const stats = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const dayTasks = tasks.filter(t => t.createdAt.startsWith(dateStr));
    const dayWorkTime = workTimeRecords.filter(w => w.date === dateStr);
    const hours = dayWorkTime.reduce((sum, w) => sum + w.totalHours, 0);

    stats.push({
      date: dateStr,
      label: date.toLocaleDateString('ru-RU', { weekday: 'short' }),
      dayNum: date.getDate(),
      completed: dayTasks.filter(t => t.status === 'completed').length,
      hours: hours
    });
  }

  const maxTasks = Math.max(...stats.map(s => s.completed), 1);
  const maxHours = Math.max(...stats.map(s => s.hours), 1);

  statsContainer.innerHTML = `
    <div class="stats-chart">
      <h4>Завершенные задачи за неделю</h4>
      <div class="chart-bars">
        ${stats.map(s => `
          <div class="chart-bar-container">
            <div class="chart-bar-value">${s.completed}</div>
            <div class="chart-bar" style="height: ${Math.max((s.completed / maxTasks) * 100, s.completed > 0 ? 10 : 0)}%"></div>
            <div class="chart-label">${s.label} ${s.dayNum}</div>
          </div>
        `).join('')}
      </div>
    </div>
    <div class="stats-chart">
      <h4>Отработанные часы за неделю</h4>
      <div class="chart-bars">
        ${stats.map(s => `
          <div class="chart-bar-container">
            <div class="chart-bar-value">${s.hours.toFixed(1)}</div>
            <div class="chart-bar" style="height: ${Math.max((s.hours / maxHours) * 100, s.hours > 0 ? 10 : 0)}%"></div>
            <div class="chart-label">${s.label} ${s.dayNum}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderHistory() {
  const container = document.getElementById('historyContainer');

  if (historyLog.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>История действий пуста</p></div>';
    return;
  }

  const sortedHistory = [...historyLog].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 50);

  const actionLabels = {
    create: 'Создано',
    update: 'Изменено',
    delete: 'Удалено',
    status_change: 'Изменение статуса'
  };

  container.innerHTML = sortedHistory.map(item => `
    <div class="history-item">
      <div class="history-time">${new Date(item.timestamp).toLocaleString('ru-RU')}</div>
      <div class="history-user">${item.userName}</div>
      <div class="history-action">${actionLabels[item.action] || item.action}</div>
      <div class="history-entity">${item.entity}: ${item.details}</div>
    </div>
  `).join('');
}

function renderTemplates() {
  const container = document.getElementById('templatesContainer');

  if (taskTemplates.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>Нет шаблонов</p></div>';
    return;
  }

  container.innerHTML = taskTemplates.map(template => `
    <div class="template-card">
      <div class="template-title">${template.title}</div>
      <div class="template-desc">${template.description}</div>
      <div class="template-priority">
        <span class="priority-badge ${template.priority}">${getPriorityLabel(template.priority)}</span>
      </div>
      <button class="btn btn-sm btn-primary" onclick="useTemplate('${template.id}')">Использовать</button>
      <button class="btn btn-sm btn-danger" onclick="deleteTemplate('${template.id}')">Удалить</button>
    </div>
  `).join('');
}

function getPriorityLabel(priority) {
  const labels = { low: 'Низкий', medium: 'Средний', high: 'Высокий', emergency: 'Аварийный' };
  return labels[priority] || priority;
}

function useTemplate(id) {
  const template = taskTemplates.find(t => t.id === id);
  if (!template) return;

  showAddTaskModal();
  document.getElementById('taskTitle').value = template.title;
  document.getElementById('taskDescription').value = template.description;
  document.getElementById('taskAddress').value = template.address || '';
  document.getElementById('taskPriority').value = template.priority;
}

function deleteTemplate(id) {
  if (!confirm('Удалить шаблон?')) return;
  taskTemplates = taskTemplates.filter(t => t.id !== id);
  saveData();
  renderTemplates();
}

function showAddBrigadeModal() {
  document.getElementById('brigadeModalTitle').textContent = 'Добавить бригаду';
  document.getElementById('brigadeForm').reset();
  document.getElementById('brigadeId').value = '';
  document.getElementById('brigadeModal').classList.add('active');
}

function editBrigade(id) {
  const brigade = brigades.find(b => b.id === id);
  if (!brigade) return;

  document.getElementById('brigadeModalTitle').textContent = 'Редактировать бригаду';
  document.getElementById('brigadeId').value = brigade.id;
  document.getElementById('brigadeName').value = brigade.name;
  document.getElementById('brigadeMembers').value = brigade.members.join(', ');
  document.getElementById('brigadePhone').value = brigade.phone;
  document.getElementById('brigadeShiftStart').value = brigade.shiftStart;
  document.getElementById('brigadeShiftEnd').value = brigade.shiftEnd;
  document.getElementById('brigadeModal').classList.add('active');
}

function closeBrigadeModal() {
  document.getElementById('brigadeModal').classList.remove('active');
}

function handleBrigadeSubmit(e) {
  e.preventDefault();

  const id = document.getElementById('brigadeId').value;
  const name = document.getElementById('brigadeName').value;
  const membersStr = document.getElementById('brigadeMembers').value;
  const members = membersStr.split(',').map(m => m.trim()).filter(m => m);
  const phone = document.getElementById('brigadePhone').value;
  const shiftStart = document.getElementById('brigadeShiftStart').value;
  const shiftEnd = document.getElementById('brigadeShiftEnd').value;

  if (id) {
    const index = brigades.findIndex(b => b.id === id);
    if (index !== -1) {
      brigades[index] = { ...brigades[index], name, members, phone, shiftStart, shiftEnd };
      addHistory('update', 'бригада', id, name);
    }
  } else {
    brigades.push({ id: generateId(), name, members, phone, shiftStart, shiftEnd, status: 'free', lastBreak: null });
    addHistory('create', 'бригада', null, name);
  }

  saveData();
  closeBrigadeModal();
  renderBrigadesList();
  renderDashboard();
}

function deleteBrigade(id) {
  if (!confirm('Вы уверены, что хотите удалить эту бригаду?')) return;
  const brigade = brigades.find(b => b.id === id);
  brigades = brigades.filter(b => b.id !== id);
  addHistory('delete', 'бригада', id, brigade ? brigade.name : '');
  saveData();
  renderBrigadesList();
  renderDashboard();
}

function openBrigadeMobile(brigadeId) {
  window.open('brigade.html?brigade=' + brigadeId, '_blank');
}

function populateBrigadeSelect() {
  const select = document.getElementById('taskBrigade');
  select.innerHTML = '<option value="">Не назначена</option>';
  brigades.forEach(brigade => {
    select.innerHTML += `<option value="${brigade.id}">${brigade.name}</option>`;
  });
}

function showAddTaskModal() {
  populateBrigadeSelect();
  document.getElementById('taskModalTitle').textContent = 'Добавить задачу';
  document.getElementById('taskForm').reset();
  document.getElementById('taskId').value = '';
  document.getElementById('taskModal').classList.add('active');
}

function editTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  populateBrigadeSelect();
  document.getElementById('taskModalTitle').textContent = 'Редактировать задачу';
  document.getElementById('taskId').value = task.id;
  document.getElementById('taskTitle').value = task.title;
  document.getElementById('taskDescription').value = task.description || '';
  document.getElementById('taskAddress').value = task.address;
  document.getElementById('taskPriority').value = task.priority;
  document.getElementById('taskBrigade').value = task.brigadeId || '';
  document.getElementById('taskModal').classList.add('active');
}

function closeTaskModal() {
  document.getElementById('taskModal').classList.remove('active');
}

function handleTaskSubmit(e) {
  e.preventDefault();

  const id = document.getElementById('taskId').value;
  const title = document.getElementById('taskTitle').value;
  const description = document.getElementById('taskDescription').value;
  const address = document.getElementById('taskAddress').value;
  const priority = document.getElementById('taskPriority').value;
  const brigadeId = document.getElementById('taskBrigade').value || null;

  if (id) {
    const index = tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      const oldTask = tasks[index];
      tasks[index] = { ...oldTask, title, description, address, priority, brigadeId };
      addHistory('update', 'задача', id, title);

      if (brigadeId && !oldTask.startedAt) {
        tasks[index].startedAt = new Date().toISOString();
        tasks[index].status = 'in_progress';
        addHistory('status_change', 'задача', id, 'В работе');

        const brigadeIndex = brigades.findIndex(b => b.id === brigadeId);
        if (brigadeIndex !== -1) brigades[brigadeIndex].status = 'working';
      }
    }
  } else {
    const now = new Date().toISOString();
    tasks.push({
      id: generateId(), title, description, address, priority, brigadeId,
      status: 'new', createdAt: now, startedAt: null, completedAt: null, photos: []
    });
    addHistory('create', 'задача', null, title);

    if (priority === 'emergency') sendNotification('Аварийная задача!', title);

    if (brigadeId) {
      const brigadeIndex = brigades.findIndex(b => b.id === brigadeId);
      if (brigadeIndex !== -1) brigades[brigadeIndex].status = 'working';
    }
  }

  saveData();
  closeTaskModal();
  renderTasksTable();
  renderDashboard();
}

function deleteTask(id) {
  if (!confirm('Вы уверены, что хотите удалить эту задачу?')) return;
  const task = tasks.find(t => t.id === id);
  tasks = tasks.filter(t => t.id !== id);
  addHistory('delete', 'задача', id, task ? task.title : '');
  saveData();
  renderTasksTable();
  renderDashboard();
}

function showTaskPhotos(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>Фото - ${task.title}</h3>
        <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
      </div>
      <div class="modal-body">
        <div class="photo-upload-area">
          <input type="file" id="photoInput" accept="image/*" multiple style="display:none">
          <button class="btn btn-primary" onclick="document.getElementById('photoInput').click()">Добавить фото</button>
        </div>
        <div class="photos-grid" id="photosGrid">
          ${(task.photos || []).length ? task.photos.map((src, i) => `<div class="photo-item"><img src="${src}" alt="Photo ${i+1}"></div>`).join('') : '<p style="color: var(--text-secondary)">Нет фото</p>'}
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById('photoInput').addEventListener('change', function(e) {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = function(evt) {
        if (!task.photos) task.photos = [];
        task.photos.push(evt.target.result);
        saveData();
        renderTasksTable();
        modal.querySelector('#photosGrid').innerHTML = task.photos.map((src, i) => `<div class="photo-item"><img src="${src}" alt="Photo ${i+1}"></div>`).join('');
      };
      reader.readAsDataURL(file);
    });
  });
}

function initNotifications() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

function sendNotification(title, body) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body, icon: 'icon.png' });
  }
}

function startBreakReminders() {
  setInterval(() => {
    brigades.forEach(brigade => {
      if (brigade.status === 'working') {
        const now = new Date();
        const lastBreak = brigade.lastBreak ? new Date(brigade.lastBreak) : new Date(now.getTime() - 4 * 60 * 60 * 1000);
        const hoursSinceBreak = (now - lastBreak) / (1000 * 60 * 60);

        if (hoursSinceBreak >= 2) {
          sendNotification('Перерыв', `Бригада ${brigade.name} должна сделать перерыв!`);
        }
      }
    });
  }, 60 * 60 * 1000);
}

function exportToCSV() {
  const headers = ['Дата', 'Задача', 'Бригада', 'Адрес', 'Приоритет', 'Статус'];
  const rows = tasks.map(t => {
    const brigade = brigades.find(b => b.id === t.brigadeId);
    return [
      new Date(t.createdAt).toLocaleDateString('ru-RU'),
      t.title,
      brigade ? brigade.name : '-',
      t.address,
      t.priority,
      t.status
    ];
  });

  const csv = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `отчет_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
}

function exportToPDF() {
  const content = `
    <html>
    <head><title>Отчет Вода Донбасса</title></head>
    <body style="font-family: Arial, sans-serif; padding: 20px;">
      <h1>Отчет о задачах</h1>
      <p>Дата: ${new Date().toLocaleDateString('ru-RU')}</p>
      <table border="1" cellpadding="5" style="border-collapse: collapse; width: 100%;">
        <tr><th>Задача</th><th>Бригада</th><th>Адрес</th><th>Статус</th></tr>
        ${tasks.map(t => {
          const brigade = brigades.find(b => b.id === t.brigadeId);
          return `<tr><td>${t.title}</td><td>${brigade ? brigade.name : '-'}</td><td>${t.address}</td><td>${t.status}</td></tr>`;
        }).join('')}
      </table>
      <p>Всего задач: ${tasks.length}</p>
    </body>
    </html>
  `;
  const printWindow = window.open('', '_blank');
  printWindow.document.write(content);
  printWindow.document.close();
  printWindow.print();
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
}

function showAddTemplateModal() {
  document.getElementById('templateForm').reset();
  document.getElementById('templateModal').classList.add('active');
}

function closeTemplateModal() {
  document.getElementById('templateModal').classList.remove('active');
}

function handleTemplateSubmit(e) {
  e.preventDefault();
  const title = document.getElementById('templateTitle').value;
  const description = document.getElementById('templateDescription').value;
  const address = document.getElementById('templateAddress').value;
  const priority = document.getElementById('templatePriority').value;

  taskTemplates.push({
    id: generateId(),
    title,
    description,
    address,
    priority
  });

  saveData();
  closeTemplateModal();
  renderTemplates();
}

let selectedChatBrigadeId = null;

function renderChat() {
  const brigadesList = document.getElementById('chatBrigadesList');
  
  brigadesList.innerHTML = brigades.map(brigade => {
    const brigadeChats = chats.filter(c => c.brigadeId === brigade.id);
    const lastMsg = brigadeChats[brigadeChats.length - 1];
    const preview = lastMsg ? (lastMsg.text.length > 30 ? lastMsg.text.substring(0, 30) + '...' : lastMsg.text) : 'Нет сообщений';
    
    return `
      <div class="chat-brigade-item ${selectedChatBrigadeId === brigade.id ? 'active' : ''}" onclick="selectChatBrigade('${brigade.id}')">
        <div class="chat-brigade-item-name">${brigade.name}</div>
        <div class="chat-brigade-item-preview">${preview}</div>
      </div>
    `;
  }).join('');
  
  if (!selectedChatBrigadeId && brigades.length > 0) {
    selectChatBrigade(brigades[0].id);
  } else {
    renderChatMessages();
  }
}

function selectChatBrigade(brigadeId) {
  selectedChatBrigadeId = brigadeId;
  renderChat();
}

function renderChatMessages() {
  const container = document.getElementById('chatAdminMessages');
  
  if (!selectedChatBrigadeId) {
    container.innerHTML = '<p style="text-align:center;color:var(--text-secondary)">Выберите бригаду</p>';
    return;
  }
  
  const brigadeChats = chats.filter(c => c.brigadeId === selectedChatBrigadeId);
  
  if (brigadeChats.length === 0) {
    container.innerHTML = '<p style="text-align:center;color:var(--text-secondary)">Нет сообщений с этой бригадой</p>';
    return;
  }
  
  container.innerHTML = brigadeChats.map(msg => `
    <div class="chat-admin-msg ${msg.from === 'brigade' ? 'from-brigade' : 'from-dispatcher'}">
      ${msg.text}
      <div class="chat-admin-msg-time">${new Date(msg.timestamp).toLocaleString('ru-RU')}</div>
    </div>
  `).join('');
  
  container.scrollTop = container.scrollHeight;
}

function sendAdminMessage() {
  const input = document.getElementById('chatAdminInput');
  const text = input.value.trim();
  
  if (!text || !selectedChatBrigadeId) return;
  
  chats.push({
    id: generateId(),
    timestamp: new Date().toISOString(),
    from: 'dispatcher',
    to: selectedChatBrigadeId,
    brigadeId: selectedChatBrigadeId,
    text: text
  });
  
  saveData();
  input.value = '';
  renderChatMessages();
}

document.addEventListener('DOMContentLoaded', init);