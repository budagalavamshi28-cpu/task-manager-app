const API = '';
let token = localStorage.getItem('token');
let allTasks = [];

// Check if already logged in
if (token) showDashboard();

// =====================
// AUTH FUNCTIONS
// =====================

function showTab(tab) {
  document.getElementById('login-form').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('signup-form').style.display = tab === 'signup' ? 'block' : 'none';
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  event.target.classList.add('active');
}

async function signup() {
  const name = document.getElementById('signup-name').value;
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;

  if (!name || !email || !password) {
    showMessage('Please fill all fields'); return;
  }

  const res = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });

  const data = await res.json();
  if (res.ok) {
    token = data.token;
    localStorage.setItem('token', token);
    localStorage.setItem('userName', data.user.name);
    showDashboard();
  } else {
    showMessage(data.message);
  }
}

async function login() {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  if (!email || !password) {
    showMessage('Please fill all fields'); return;
  }

  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();
  if (res.ok) {
    token = data.token;
    localStorage.setItem('token', token);
    localStorage.setItem('userName', data.user.name);
    showDashboard();
  } else {
    showMessage(data.message);
  }
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('userName');
  token = null;
  document.getElementById('auth-section').style.display = 'flex';
  document.getElementById('dashboard-section').style.display = 'none';
}

function showDashboard() {
  document.getElementById('auth-section').style.display = 'none';
  document.getElementById('dashboard-section').style.display = 'block';
  document.getElementById('user-name').textContent =
    'Hi, ' + (localStorage.getItem('userName') || 'User');
  loadTasks();
}

function showMessage(msg) {
  document.getElementById('auth-message').textContent = msg;
}

// =====================
// TASK FUNCTIONS
// =====================

async function loadTasks() {
  const res = await fetch('/api/tasks', {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  allTasks = await res.json();
  renderTasks(allTasks);
}

async function addTask() {
  const title = document.getElementById('task-title').value.trim();
  const description = document.getElementById('task-desc').value.trim();
  const priority = document.getElementById('task-priority').value;

  if (!title) { alert('Please enter a task title'); return; }

  const res = await fetch('/api/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({ title, description, priority })
  });

  if (res.ok) {
    document.getElementById('task-title').value = '';
    document.getElementById('task-desc').value = '';
    loadTasks();
  }
}

async function updateStatus(id, currentStatus) {
  const nextStatus = {
    'pending': 'in-progress',
    'in-progress': 'completed',
    'completed': 'pending'
  };

  await fetch(`/api/tasks/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({ status: nextStatus[currentStatus] })
  });
  loadTasks();
}

async function deleteTask(id) {
  if (!confirm('Delete this task?')) return;
  await fetch(`/api/tasks/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': 'Bearer ' + token }
  });
  loadTasks();
}

function filterTasks(status, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  if (status === 'all') {
    renderTasks(allTasks);
  } else {
    renderTasks(allTasks.filter(t => t.status === status));
  }
}

function renderTasks(tasks) {
  const list = document.getElementById('tasks-list');
  if (tasks.length === 0) {
    list.innerHTML = '<div class="empty-state">No tasks found. Add one above! 🎯</div>';
    return;
  }

  list.innerHTML = tasks.map(task => `
    <div class="task-card ${task.status === 'completed' ? 'completed' : ''}">
      <div class="task-info">
        <div class="task-title">${task.title}</div>
        ${task.description ? `<div class="task-desc">${task.description}</div>` : ''}
        <div class="task-meta">
          <span class="badge badge-${task.status}">${task.status}</span>
          <span class="badge badge-${task.priority}">${task.priority}</span>
        </div>
      </div>
      <div class="task-actions">
        <button class="btn-status" onclick="updateStatus('${task._id}', '${task.status}')">
          ${task.status === 'pending' ? '▶ Start' :
            task.status === 'in-progress' ? '✔ Done' : '↩ Redo'}
        </button>
        <button class="btn-delete" onclick="deleteTask('${task._id}')">🗑</button>
      </div>
    </div>
  `).join('');
}