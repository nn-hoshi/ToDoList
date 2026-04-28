// STATE
let state = {
  tasks: [],
  filter: 'all',
  confirmed: false,
  finished: false,
};

// PURE FUNCTIONS

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
  const maxWidth = 760; // подгони под свою картинку
  bar.style.width = (maxWidth * percent) / 100 + 'px';
};

const updateStats = () => {
  const box = document.getElementById('statsBox');
  const { total, completed, percent } = getStats(state.tasks);
};


// RENDER

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

  if (state.confirmed) {
    updateProgress();
  }
  updateStats();
};

document.getElementById('finishTasksBtn').addEventListener('click', () => {
  if (state.tasks.length === 0) return;

  state.finished = true;

  const { percent } = getStats(state.tasks);
  const isVictory = percent >= 50;

  document.querySelector('.container').classList.add('fade-out');
  document.querySelector('.progress-container').classList.add('fade-out');

  setTimeout(() => {
    document.querySelector('.container').style.display = 'none';
    document.querySelector('.progress-container').style.display = 'none';

    showEndScreen(isVictory);
  }, 500);
});

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
  const error = document.getElementById('errorMsg');

  if (state.tasks.length === 0) {
    error.textContent = 'Список задач пуст!';
    return;
  }

  error.textContent = '';
  state.confirmed = true;

  document.getElementById('confirmBtn').style.display = 'none';
  document.getElementById('filters').style.display = 'flex';
  document.getElementById('inputBlock').style.display = 'none';

  document.querySelector('.progress-container').style.display = 'block';
  document.querySelector('.stats').style.display = 'block';

  document.querySelector('.container').classList.add('left-mode');

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

const victorySound = new Audio(
  'https://static.wikia.nocookie.net/among-us-wiki/images/5/51/Crewmate_victory_music.ogg/revision/latest?cb=20200914131738',
);
victorySound.volume = 0.2;

const defeatSound = new Audio(
  'https://static.wikia.nocookie.net/among-us-wiki/images/d/d7/Victory_impostor.wav/revision/latest?cb=20250329225138',
);

defeatSound.volume = 0.2;

const exitBtn = document.getElementById('exitBtn');

const exitApp = () => {
  window.close();
};

const showEndScreen = (isVictory) => {
  const screen = document.getElementById('resultScreen');
  const content = document.getElementById('resultContent');

  const { total, completed, percent } = getStats(state.tasks);

  screen.classList.add('show');
  screen.classList.remove('victory', 'defeat');

  content.innerHTML = '';

  setTimeout(() => {
    const type = isVictory ? 'victory' : 'defeat';
    screen.classList.add(type);

    const title = document.createElement('div');
    title.className = 'result-title';
    title.textContent = isVictory ? 'Victory' : 'Defeat';

    const subtitle = document.createElement('div');
    subtitle.className = 'result-subtitle';

    subtitle.textContent = isVictory ? 'Good Work!' : 'Lazy Imposter WINS';

    const text = document.createElement('div');
    text.className = 'result-text';

    text.innerHTML = `
      Выполнено: ${completed} / ${total}<br>
      Прогресс: ${percent}%
    `;

    content.appendChild(title);
    content.appendChild(subtitle);
    content.appendChild(text);


    requestAnimationFrame(() => {
      title.classList.add('show');
      subtitle.classList.add('show');
    });

    // SOUND
    if (isVictory) {
      victorySound.currentTime = 0;
      victorySound.play().catch(() => {});
    } else {
      defeatSound.currentTime = 0;
      defeatSound.play().catch(() => {});
    }
  }, 1500);

  // 🔥 EXIT BUTTON CONTROL (ВАЖНО: НЕ пересоздаём события!)
  setTimeout(() => {
    exitBtn.classList.add('show');
  }, 3000);

  // назначаем ОДИН раз
  exitBtn.onclick = exitApp;
};

// INIT
render();
bindFilterEvents();
