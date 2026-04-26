// =====================
// STATE
// =====================
let state = {
  tasks: [],
  filter: 'all',
  confirmed: false,
  finished: false,
};

// =====================
// PURE FUNCTIONS
// =====================

const addTask = (tasks, text) => [
  ...tasks,
  {
    id: Date.now(),
    text,
    status: 'active',
  },
];

const toggleTask = (tasks, id) =>
  tasks.map((t) =>
    t.id === id
      ? {
          ...t,
          status: t.status === 'completed' ? 'active' : 'completed',
        }
      : t,
  );

const rejectTask = (tasks, id) =>
  tasks.map((t) => (t.id === id ? { ...t, status: 'rejected' } : t));

const filterTasks = (tasks, filter) => {
  switch (filter) {
    case 'active':
      return tasks.filter((t) => t.status === 'active');
    case 'completed':
      return tasks.filter((t) => t.status === 'completed');
    case 'rejected':
      return tasks.filter((t) => t.status === 'rejected');
    default:
      return tasks;
  }
};

// =====================
// PROGRESS + STATS
// =====================

const getStats = (tasks) => {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === 'completed').length;

  const percent = total ? Math.round((completed / total) * 100) : 0;

  return { total, completed, percent };
};

const updateProgress = () => {
  const bar = document.getElementById('progressBar');
  const { percent } = getStats(state.tasks);
  bar.style.width = percent + '%';
};

const updateStats = () => {
  const box = document.getElementById('statsBox');
  const { total, completed, percent } = getStats(state.tasks);

  box.innerHTML = `Выполнено: ${completed} / ${total} (${percent}%)`;
};

// =====================
// CHECK IF FINISHED
// =====================

const checkFinished = () => {
  const allDone = state.tasks.every(
    (t) => t.status === 'completed' || t.status === 'rejected',
  );

  if (allDone && state.tasks.length > 0) {
    state.finished = true;
    showResult();
  }
};

// =====================
// RESULT WINDOW
// =====================

const showResult = () => {
  const modal = document.getElementById('resultModal');
  const { total, completed, percent } = getStats(state.tasks);

  modal.style.display = 'block';
  modal.innerHTML = `
        🎉 Все задачи завершены!<br><br>
        Выполнено: ${completed} / ${total}<br>
        Прогресс: ${percent}%
    `;
};

// =====================
// RENDER
// =====================
const render = () => {
  const list = document.getElementById('taskList');
  list.innerHTML = '';

  const filtered = filterTasks(state.tasks, state.filter);

  filtered.forEach((task) => {
    const li = document.createElement('li');

    li.innerHTML = `
            <span class="${
              task.status === 'completed'
                ? 'completed'
                : task.status === 'rejected'
                  ? 'rejected'
                  : ''
            }">
                ${task.text}
            </span>

            ${
              state.confirmed && !state.finished
                ? `<div>
                        <button onclick="handleToggle(${task.id})">✔</button>
                        <button onclick="handleReject(${task.id})">✖</button>
                   </div>`
                : ''
            }
        `;

    list.appendChild(li);
  });

  updateProgress();
  updateStats();
  checkFinished();
};

// =====================
// ACTIONS
// =====================

const handleAddTask = () => {
  const input = document.getElementById('taskInput');
  const text = input.value.trim();
  if (!text) return;

  state = {
    ...state,
    tasks: addTask(state.tasks, text),
  };

  input.value = '';
  render();
};

const handleToggle = (id) => {
  state = {
    ...state,
    tasks: toggleTask(state.tasks, id),
  };
  render();
};

const handleReject = (id) => {
  state = {
    ...state,
    tasks: rejectTask(state.tasks, id),
  };
  render();
};

// =====================
// CONFIRM LIST
// =====================
document.getElementById('confirmBtn').addEventListener('click', () => {
  state.confirmed = true;

  // скрываем кнопку подтверждения
  document.getElementById('confirmBtn').style.display = 'none';

  // показываем фильтры
  document.getElementById('filters').style.display = 'flex';

  // СКРЫВАЕМ ВВОД ЗАДАЧ
  document.getElementById('inputBlock').style.display = 'none';

  render();
});

// =====================
// EVENTS
// =====================

document.getElementById('addBtn').addEventListener('click', handleAddTask);

document.getElementById('taskInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleAddTask();
});

const bindFilterEvents = () => {
  document.querySelectorAll('.filters button').forEach((btn) => {
    btn.onclick = () => {
      state.filter = btn.dataset.filter;
      render();
      bindFilterEvents();
    };
  });
};

// INIT
render();
