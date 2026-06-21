// Global State Manager (with localStorage fallbacks)
const state = {
  tasks: JSON.parse(localStorage.getItem('aether_tasks')) || [
    { id: 1, title: "Prepare Chemistry exam summary sheet", category: "Exam", priority: "High", deadline: "2026-06-25", completed: false },
    { id: 2, title: "Write initial skeleton code for final project", category: "Project", priority: "Medium", deadline: "2026-06-28", completed: false },
    { id: 3, title: "Solve advanced integration math exercises", category: "Homework", priority: "Low", deadline: "2026-06-23", completed: true }
  ],
  notes: JSON.parse(localStorage.getItem('aether_notes')) || [
    { id: 1, title: "Feynman Study Protocol", content: "1. Choose a concept you want to learn.\n2. Write an explanation as if teaching a child.\n3. Identify gaps and return to source material.\n4. Simplify terminology and use analogies.", tag: "Methodology", date: "Jun 21, 2026" },
    { id: 2, title: "Database Normalization Rules", content: "1NF: Eliminate duplicate columns, create separate tables.\n2NF: Meet 1NF, ensure no partial dependencies.\n3NF: Meet 2NF, remove transitive dependencies.", tag: "CS", date: "Jun 20, 2026" }
  ],
  deadlines: JSON.parse(localStorage.getItem('aether_deadlines')) || [
    { id: 1, title: "Physics Lab Term Report", datetime: "2026-06-24T23:59" },
    { id: 2, title: "Intro Calculus Midterm Exam", datetime: "2026-06-29T09:00" }
  ],
  habits: JSON.parse(localStorage.getItem('aether_habits')) || [
    { id: 1, name: "Read scientific articles 15m", completedToday: false, streak: 3 },
    { id: 2, name: "Drink 2L Water", completedToday: true, streak: 5 },
    { id: 3, name: "Solve 1 Leetcode problem", completedToday: false, streak: 2 }
  ],
  gpaCourses: JSON.parse(localStorage.getItem('aether_gpa')) || [
    { id: 1, name: "Introduction to Calculus", grade: "A", credits: 4 },
    { id: 2, name: "General Physics I", grade: "B", credits: 3 },
    { id: 3, name: "Data Structures & Algorithms", grade: "A", credits: 4 }
  ],
  focusMinutesToday: parseInt(localStorage.getItem('aether_focus_minutes')) || 45,
  weeklyFocusSessions: JSON.parse(localStorage.getItem('aether_focus_sessions')) || [
    { day: "Mon", minutes: 30 },
    { day: "Tue", minutes: 60 },
    { day: "Wed", minutes: 45 },
    { day: "Thu", minutes: 90 },
    { day: "Fri", minutes: 25 },
    { day: "Sat", minutes: 50 },
    { day: "Sun", minutes: 45 }
  ]
};

// State Helper Functions
function saveState(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Web Audio API Soundscape Synth
let audioCtx = null;
let activeSoundNode = null;
let soundGainNode = null;
let isPlayingSoundscape = false;
let currentSoundscape = "";

function initAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function playBeepAlarm() {
  try {
    initAudioContext();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
    
    gain.gain.setValueAtTime(0.5, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 1.2);
  } catch(e) {
    console.error("Audio Context alarm issue:", e);
  }
}

// Ambient Synth Generators
function createNoiseBuffer(type) {
  const sampleRate = audioCtx.sampleRate;
  const bufferSize = 2 * sampleRate; // 2 seconds
  const noiseBuffer = audioCtx.createBuffer(1, bufferSize, sampleRate);
  const output = noiseBuffer.getChannelData(0);
  
  if (type === 'white') {
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
  } else if (type === 'brown') {
    // Brown noise has deep rumbling spectrum (simulates rain/ocean)
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      let white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5; // volume compensation
    }
  }
  return noiseBuffer;
}

function stopSoundscape() {
  if (activeSoundNode) {
    try {
      activeSoundNode.stop();
      activeSoundNode.disconnect();
    } catch(e) {}
    activeSoundNode = null;
  }
  isPlayingSoundscape = false;
  currentSoundscape = "";
  document.querySelectorAll('.sound-card').forEach(btn => btn.classList.remove('active'));
}

function startSoundscape(type) {
  initAudioContext();
  stopSoundscape();
  
  soundGainNode = audioCtx.createGain();
  const vol = document.getElementById('soundscape-volume').value / 100;
  soundGainNode.gain.setValueAtTime(vol, audioCtx.currentTime);
  
  if (type === 'white' || type === 'rain') {
    const buffer = createNoiseBuffer(type === 'rain' ? 'brown' : 'white');
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    
    if (type === 'rain') {
      // Add Low-pass filter to soft-down rain sound
      const filter = audioCtx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(700, audioCtx.currentTime);
      
      source.connect(filter);
      filter.connect(soundGainNode);
    } else {
      source.connect(soundGainNode);
    }
    
    soundGainNode.connect(audioCtx.destination);
    source.start(0);
    activeSoundNode = source;
    
  } else if (type === 'cafe') {
    // Generate low murmur rumble (lowpass brown + slow pitch sine wobble)
    const buffer = createNoiseBuffer('brown');
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    
    const filter = audioCtx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(180, audioCtx.currentTime);
    filter.Q.setValueAtTime(1.5, audioCtx.currentTime);
    
    // Add low drone oscillator
    const drone = audioCtx.createOscillator();
    drone.type = "sine";
    drone.frequency.setValueAtTime(90, audioCtx.currentTime);
    
    const droneGain = audioCtx.createGain();
    droneGain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    
    source.connect(filter);
    filter.connect(soundGainNode);
    drone.connect(droneGain);
    droneGain.connect(soundGainNode);
    
    soundGainNode.connect(audioCtx.destination);
    
    source.start(0);
    drone.start(0);
    
    // Wrap to a custom object to stop both
    activeSoundNode = {
      stop: () => {
        source.stop();
        drone.stop();
        source.disconnect();
        drone.disconnect();
      }
    };
    
  } else if (type === 'lofi') {
    // Synthesis of a warm focus drone chord
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const filter = audioCtx.createBiquadFilter();
    
    osc1.type = "triangle";
    osc1.frequency.setValueAtTime(110, audioCtx.currentTime); // A2 Note
    
    osc2.type = "sawtooth";
    osc2.frequency.setValueAtTime(110.5, audioCtx.currentTime); // Detuned A2 Note
    
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(180, audioCtx.currentTime);
    
    // Create soft LFO to modulate filter frequency for vinyl/ambient warmth
    const lfo = audioCtx.createOscillator();
    const lfoGain = audioCtx.createGain();
    lfo.type = "sine";
    lfo.frequency.setValueAtTime(0.2, audioCtx.currentTime); // 0.2Hz wobble
    lfoGain.gain.setValueAtTime(40, audioCtx.currentTime); // depth 40Hz
    
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    
    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(soundGainNode);
    
    soundGainNode.connect(audioCtx.destination);
    
    osc1.start(0);
    osc2.start(0);
    lfo.start(0);
    
    activeSoundNode = {
      stop: () => {
        osc1.stop();
        osc2.stop();
        lfo.stop();
        osc1.disconnect();
        osc2.disconnect();
        lfo.disconnect();
      }
    };
  }
  
  isPlayingSoundscape = true;
  currentSoundscape = type;
  document.querySelector(`.sound-card[data-sound="${type}"]`).classList.add('active');
}

// Initial Navigation & Sidebar Switching
function switchTab(tabId) {
  document.querySelectorAll('.tab-panel').forEach(panel => {
    panel.classList.remove('active');
  });
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('data-tab') === tabId) {
      btn.classList.add('active');
    }
  });
  
  const targetPanel = document.getElementById(tabId);
  if (targetPanel) {
    targetPanel.classList.add('active');
  }
  
  // Custom action logic on tab switch
  if (tabId === 'utilities') {
    renderAnalyticsChart();
  }
  
  // Close mobile sidebar if open
  document.getElementById('sidebar').classList.remove('active');
}

// UI Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  lucide.createIcons();
  
  // Add clock & greeting setup
  updateHeaderClock();
  setInterval(updateHeaderClock, 60000);
  
  // Load Quote
  displayRandomQuote();
  
  // Sidebar Navigation Click Binding
  document.querySelectorAll('.sidebar-nav button').forEach(button => {
    button.addEventListener('click', (e) => {
      const tab = e.currentTarget.getAttribute('data-tab');
      switchTab(tab);
    });
  });

  // Mobile menu toggle
  document.getElementById('mobile-menu-toggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('active');
  });

  // General Modal bindings
  setupModals();

  // Load Task elements
  renderTasks();
  
  // Load Note elements
  renderNotes();
  
  // Load Deadlines
  renderDeadlines();
  
  // Start counting down deadlines in real-time
  setInterval(renderDeadlines, 1000);

  // Initialize Focus Timer
  initFocusTimer();

  // Initialize focus soundscapes
  initSoundscapes();

  // Initialize Habit & GPA modules
  initHabits();
  initGPA();

  // Initialize Chat triggers
  initChatBot();
  
  // Quick Tip Refresh binding
  document.getElementById('new-tip-btn').addEventListener('click', displayRandomTip);
  displayRandomTip();
  
  // Stats refresh
  updateDashboardStats();
});

// Clock & Date Helper
function updateHeaderClock() {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  const now = new Date();
  const dayName = days[now.getDay()];
  const monthName = months[now.getMonth()];
  const dateNum = now.getDate();
  const year = now.getFullYear();
  
  // Update header text
  document.getElementById('header-date').innerText = `${dayName}, ${monthName} ${dateNum}, ${year}`;
  
  // Set Dynamic Greeting
  const hour = now.getHours();
  let greet = "Good evening, Scholar!";
  if (hour < 12) greet = "Good morning, Scholar!";
  else if (hour < 17) greet = "Good afternoon, Scholar!";
  
  document.getElementById('dynamic-greeting').innerText = greet;
}

// Quote Selector Helper
function displayRandomQuote() {
  const randomIndex = Math.floor(Math.random() * MOCK_DATA.quotes.length);
  document.getElementById('random-quote').innerText = MOCK_DATA.quotes[randomIndex];
}

// Dynamic Tip Selector
function displayRandomTip() {
  const randomIndex = Math.floor(Math.random() * MOCK_DATA.studyTips.length);
  const tip = MOCK_DATA.studyTips[randomIndex];
  document.getElementById('tip-title').innerText = tip.title;
  document.getElementById('tip-desc').innerText = tip.desc;
}

// Dashboard statistics
function updateDashboardStats() {
  // Focus minutes
  document.getElementById('stat-focus-time').innerText = `${state.focusMinutesToday}m`;
  
  // Tasks completed
  const completed = state.tasks.filter(t => t.completed).length;
  const total = state.tasks.length;
  document.getElementById('stat-tasks-done').innerText = `${completed}/${total}`;
  
  // Upcoming active deadlines
  const now = new Date().getTime();
  const activeDeadlines = state.deadlines.filter(d => new Date(d.datetime).getTime() > now).length;
  document.getElementById('stat-deadlines-count').innerText = activeDeadlines;
  
  // Habit streak (average or highest)
  let maxStreak = 0;
  state.habits.forEach(h => {
    if (h.streak > maxStreak) maxStreak = h.streak;
  });
  document.getElementById('stat-habit-streak').innerText = `${maxStreak}d`;
}

// Modals Handling logic
function setupModals() {
  // Open Modals
  document.getElementById('open-task-modal-btn').addEventListener('click', () => {
    document.getElementById('task-modal').classList.add('active');
  });
  document.getElementById('open-note-modal-btn').addEventListener('click', () => {
    document.getElementById('note-modal').classList.add('active');
  });
  document.getElementById('open-deadline-modal-btn').addEventListener('click', () => {
    document.getElementById('deadline-modal').classList.add('active');
  });

  // Close modals
  document.querySelectorAll('.close-modal-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modalId = e.currentTarget.getAttribute('data-modal');
      document.getElementById(modalId).classList.remove('active');
    });
  });

  // Task Form Submit
  document.getElementById('task-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('task-title').value;
    const category = document.getElementById('task-category').value;
    const priority = document.getElementById('task-priority').value;
    const deadline = document.getElementById('task-deadline').value;

    const newTask = {
      id: Date.now(),
      title,
      category,
      priority,
      deadline: deadline || "No deadline",
      completed: false
    };

    state.tasks.unshift(newTask);
    saveState('aether_tasks', state.tasks);
    
    renderTasks();
    updateDashboardStats();
    
    document.getElementById('task-form').reset();
    document.getElementById('task-modal').classList.remove('active');
  });

  // Note Form Submit
  document.getElementById('note-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('note-title').value;
    const content = document.getElementById('note-content').value;
    const tag = document.getElementById('note-tag').value || "General";

    const months = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'];
    const now = new Date();
    const dateStr = `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;

    const newNote = {
      id: Date.now(),
      title,
      content,
      tag,
      date: dateStr
    };

    state.notes.unshift(newNote);
    saveState('aether_notes', state.notes);
    
    renderNotes();
    
    document.getElementById('note-form').reset();
    document.getElementById('note-modal').classList.remove('active');
  });

  // Deadline Form Submit
  document.getElementById('deadline-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('deadline-title').value;
    const datetime = document.getElementById('deadline-datetime').value;

    const newDeadline = {
      id: Date.now(),
      title,
      datetime
    };

    state.deadlines.push(newDeadline);
    saveState('aether_deadlines', state.deadlines);
    
    renderDeadlines();
    updateDashboardStats();
    
    document.getElementById('deadline-form').reset();
    document.getElementById('deadline-modal').classList.remove('active');
  });
}

// Tasks Rendering & Controllers
let activeTaskFilter = 'all';
function renderTasks() {
  const todoContainer = document.getElementById('todo-task-list');
  const completedContainer = document.getElementById('completed-task-list');
  const quickContainer = document.getElementById('quick-task-list');
  
  todoContainer.innerHTML = '';
  completedContainer.innerHTML = '';
  quickContainer.innerHTML = '';

  let filtered = state.tasks;
  if (activeTaskFilter === 'pending') filtered = state.tasks.filter(t => !t.completed);
  if (activeTaskFilter === 'completed') filtered = state.tasks.filter(t => t.completed);
  if (activeTaskFilter === 'high') filtered = state.tasks.filter(t => t.priority === 'High');

  let todoCount = 0;
  let compCount = 0;

  filtered.forEach(task => {
    const card = document.createElement('div');
    card.className = `task-card ${task.completed ? 'completed' : ''}`;
    card.innerHTML = `
      <div class="task-card-header">
        <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} onclick="toggleTaskStatus(${task.id})">
        <h4>${task.title}</h4>
        <button class="task-delete-btn" onclick="deleteTask(${task.id})"><i data-lucide="trash-2"></i></button>
      </div>
      <div class="task-card-meta">
        <div class="task-tags">
          <span class="badge">${task.category}</span>
          <span class="priority-tag ${task.priority}">${task.priority}</span>
        </div>
        <span>Due: ${task.deadline}</span>
      </div>
    `;

    if (task.completed) {
      completedContainer.appendChild(card);
      compCount++;
    } else {
      todoContainer.appendChild(card);
      todoCount++;
      
      // Inject into quick task dashboard (maximum 3 urgent)
      if (quickContainer.children.length < 3 || quickContainer.querySelector('.empty-state')) {
        if (quickContainer.querySelector('.empty-state')) quickContainer.innerHTML = '';
        
        const quickItem = document.createElement('li');
        quickItem.className = 'quick-task-item';
        quickItem.innerHTML = `
          <input type="checkbox" class="task-checkbox" onclick="toggleTaskStatus(${task.id})">
          <label onclick="toggleTaskStatus(${task.id})">${task.title}</label>
          <span class="priority-tag ${task.priority}">${task.priority}</span>
        `;
        quickContainer.appendChild(quickItem);
      }
    }
  });

  // Display Empty States
  if (todoCount === 0) {
    todoContainer.innerHTML = '<div class="empty-state">No pending tasks! All done.</div>';
  }
  if (compCount === 0) {
    completedContainer.innerHTML = '<div class="empty-state">No completed tasks yet. Keep moving!</div>';
  }
  if (quickContainer.children.length === 0) {
    quickContainer.innerHTML = '<li class="empty-state">No urgent tasks. Add some on the Task Board!</li>';
  }

  document.getElementById('todo-count').innerText = todoCount;
  document.getElementById('completed-count').innerText = compCount;

  // Setup task filters
  document.querySelectorAll('.task-filters button').forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('data-filter') === activeTaskFilter) {
      btn.classList.add('active');
    }
  });

  lucide.createIcons();
}

// Task filter click binding
document.querySelectorAll('.task-filters button').forEach(btn => {
  btn.addEventListener('click', (e) => {
    activeTaskFilter = e.currentTarget.getAttribute('data-filter');
    renderTasks();
  });
});

function toggleTaskStatus(id) {
  state.tasks = state.tasks.map(t => {
    if (t.id === id) t.completed = !t.completed;
    return t;
  });
  saveState('aether_tasks', state.tasks);
  renderTasks();
  updateDashboardStats();
}

function deleteTask(id) {
  state.tasks = state.tasks.filter(t => t.id !== id);
  saveState('aether_tasks', state.tasks);
  renderTasks();
  updateDashboardStats();
}

// Notes & Deadlines Controllers
function renderNotes() {
  const notesContainer = document.getElementById('notes-grid-container');
  notesContainer.innerHTML = '';
  
  state.notes.forEach(note => {
    const card = document.createElement('div');
    card.className = 'note-card';
    
    // Parse simplified markdown newlines
    const parsedContent = note.content.replace(/\n/g, '<br>');

    card.innerHTML = `
      <button class="note-delete-btn" onclick="deleteNote(${note.id})"><i data-lucide="x"></i></button>
      <h4>${note.title}</h4>
      <p>${parsedContent}</p>
      <div class="note-card-footer">
        <span class="note-tag-badge">${note.tag}</span>
        <span>${note.date}</span>
      </div>
    `;
    notesContainer.appendChild(card);
  });
  
  if (state.notes.length === 0) {
    notesContainer.innerHTML = '<div class="empty-state" style="grid-column: span 2">No notes added. Click Add Note to store study references.</div>';
  }
  
  lucide.createIcons();
}

function deleteNote(id) {
  state.notes = state.notes.filter(n => n.id !== id);
  saveState('aether_notes', state.notes);
  renderNotes();
}

function renderDeadlines() {
  const deadlinesContainer = document.getElementById('deadlines-list-container');
  const quickDeadlinesContainer = document.getElementById('quick-deadlines-list');
  
  deadlinesContainer.innerHTML = '';
  quickDeadlinesContainer.innerHTML = '';

  const now = new Date().getTime();
  
  // Sort deadlines chronologically
  state.deadlines.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));

  let deadlineCount = 0;

  state.deadlines.forEach(dl => {
    const dlTime = new Date(dl.datetime).getTime();
    const diff = dlTime - now;
    
    let countdownText = "";
    
    if (diff <= 0) {
      countdownText = "Completed / Past";
    } else {
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      
      if (days > 0) {
        countdownText = `${days}d ${hours}h`;
      } else {
        countdownText = `${hours}h ${mins}m ${secs}s`;
      }
    }

    const d = new Date(dl.datetime);
    const dateFormatted = d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // In Notes tab:
    const card = document.createElement('div');
    card.className = 'deadline-card';
    card.innerHTML = `
      <div class="deadline-info">
        <h4>${dl.title}</h4>
        <p>${dateFormatted}</p>
      </div>
      <div class="deadline-countdown">
        <div class="countdown-value">${countdownText}</div>
        <div class="countdown-label">Time Remaining</div>
        <button class="task-delete-btn" style="margin-top: 4px; display: inline-block" onclick="deleteDeadline(${dl.id})">
          <i data-lucide="trash-2" style="width:12px;height:12px;"></i>
        </button>
      </div>
    `;
    deadlinesContainer.appendChild(card);

    // In Dashboard Widget:
    if (deadlineCount < 3 && diff > 0) {
      const quickItem = document.createElement('div');
      quickItem.className = 'quick-deadline-item';
      quickItem.innerHTML = `
        <span class="quick-deadline-name">${dl.title}</span>
        <span class="quick-deadline-time">${countdownText}</span>
      `;
      quickDeadlinesContainer.appendChild(quickItem);
      deadlineCount++;
    }
  });

  if (state.deadlines.length === 0) {
    deadlinesContainer.innerHTML = '<div class="empty-state">No deadlines track active. Enjoy your day!</div>';
  }
  
  if (quickDeadlinesContainer.children.length === 0) {
    quickDeadlinesContainer.innerHTML = '<div class="empty-state">No active countdowns.</div>';
  }
  
  lucide.createIcons();
}

function deleteDeadline(id) {
  state.deadlines = state.deadlines.filter(d => d.id !== id);
  saveState('aether_deadlines', state.deadlines);
  renderDeadlines();
  updateDashboardStats();
}

// Focus Pomodoro Timer Module
let timerInterval = null;
let currentTimerMode = 'pomodoro'; // pomodoro, shortBreak, longBreak
let timerTimeLeft = 25 * 60; // 25 minutes default
let timerDuration = 25 * 60;
let timerIsRunning = false;

function initFocusTimer() {
  // Mode selection clicks
  document.querySelectorAll('.timer-modes button').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.timer-modes button').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      setTimerMode(e.target.getAttribute('data-mode'));
    });
  });

  // Timer actions
  document.getElementById('timer-play-pause').addEventListener('click', toggleTimer);
  document.getElementById('timer-reset').addEventListener('click', resetTimer);
  document.getElementById('timer-skip').addEventListener('click', skipTimer);
  
  // Dashboard Widget Play button
  document.getElementById('dash-timer-toggle').addEventListener('click', toggleTimer);

  // Apply custom timer configurations
  document.getElementById('apply-custom-timer').addEventListener('click', () => {
    const pomo = parseInt(document.getElementById('custom-pomo').value) || 25;
    const short = parseInt(document.getElementById('custom-short').value) || 5;
    const long = parseInt(document.getElementById('custom-long').value) || 15;
    
    // Apply changes
    if (currentTimerMode === 'pomodoro') setTimerValues(pomo);
    else if (currentTimerMode === 'shortBreak') setTimerValues(short);
    else if (currentTimerMode === 'longBreak') setTimerValues(long);
    
    // Alert feedback
    alert("Focus timer intervals updated!");
  });

  // Progress ring variables initialization
  const circle = document.querySelector('.progress-ring__circle');
  const radius = circle.r.baseVal.value;
  const circumference = radius * 2 * Math.PI;
  circle.style.strokeDasharray = `${circumference} ${circumference}`;
  circle.style.strokeDashoffset = circumference;

  updateTimerUI();
}

function setTimerValues(minutes) {
  timerTimeLeft = minutes * 60;
  timerDuration = minutes * 60;
  updateTimerUI();
}

function setTimerMode(mode) {
  currentTimerMode = mode;
  stopTimer();
  
  let mins = 25;
  if (mode === 'pomodoro') {
    mins = parseInt(document.getElementById('custom-pomo').value) || 25;
  } else if (mode === 'shortBreak') {
    mins = parseInt(document.getElementById('custom-short').value) || 5;
  } else if (mode === 'longBreak') {
    mins = parseInt(document.getElementById('custom-long').value) || 15;
  }
  
  setTimerValues(mins);
}

function updateTimerUI() {
  const mins = Math.floor(timerTimeLeft / 60);
  const secs = timerTimeLeft % 60;
  const displayVal = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  
  // Update standard display
  document.getElementById('timer-time-text').innerText = displayVal;
  
  // Update dashboard widget text
  document.getElementById('dash-timer-text').innerText = displayVal;

  // Update SVGs circular ring offset
  const circle = document.querySelector('.progress-ring__circle');
  const radius = circle.r.baseVal.value;
  const circumference = radius * 2 * Math.PI;
  const percent = timerDuration > 0 ? (timerTimeLeft / timerDuration) : 0;
  const offset = circumference - (percent * circumference);
  circle.style.strokeDashoffset = offset;

  // Toggle button icons
  const iconName = timerIsRunning ? 'pause' : 'play';
  document.getElementById('timer-play-pause').innerHTML = `<i data-lucide="${iconName}"></i> ${timerIsRunning ? 'Pause Focus' : 'Start Focus'}`;
  document.getElementById('dash-timer-toggle').innerHTML = `<i data-lucide="${iconName}"></i>`;
  lucide.createIcons();
}

function toggleTimer() {
  if (timerIsRunning) {
    stopTimer();
  } else {
    startTimer();
  }
}

function startTimer() {
  initAudioContext();
  timerIsRunning = true;
  document.getElementById('dash-timer-status').innerText = currentTimerMode === 'pomodoro' ? 'Focusing' : 'Break';
  document.getElementById('dash-timer-status').className = `badge ${currentTimerMode === 'pomodoro' ? 'badge-primary' : 'badge-secondary'}`;
  
  timerInterval = setInterval(() => {
    timerTimeLeft--;
    if (timerTimeLeft <= 0) {
      clearInterval(timerInterval);
      playBeepAlarm();
      
      // Add Focus stats if finished a Pomodoro
      if (currentTimerMode === 'pomodoro') {
        const focusMins = parseInt(document.getElementById('custom-pomo').value) || 25;
        state.focusMinutesToday += focusMins;
        localStorage.setItem('aether_focus_minutes', state.focusMinutesToday);
        
        // Log to weekly analytics
        const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const todayName = weekdays[new Date().getDay()];
        state.weeklyFocusSessions = state.weeklyFocusSessions.map(session => {
          if (session.day === todayName) {
            session.minutes += focusMins;
          }
          return session;
        });
        saveState('aether_focus_sessions', state.weeklyFocusSessions);
        updateDashboardStats();
      }
      
      // Auto toggle to breaks
      if (currentTimerMode === 'pomodoro') {
        setTimerMode('shortBreak');
        document.querySelectorAll('.timer-modes button').forEach(b => {
          b.classList.remove('active');
          if (b.getAttribute('data-mode') === 'shortBreak') b.classList.add('active');
        });
      } else {
        setTimerMode('pomodoro');
        document.querySelectorAll('.timer-modes button').forEach(b => {
          b.classList.remove('active');
          if (b.getAttribute('data-mode') === 'pomodoro') b.classList.add('active');
        });
      }
    }
    updateTimerUI();
  }, 1000);
  
  updateTimerUI();
}

function stopTimer() {
  timerIsRunning = false;
  clearInterval(timerInterval);
  document.getElementById('dash-timer-status').innerText = 'Idle';
  document.getElementById('dash-timer-status').className = 'badge';
  updateTimerUI();
}

function resetTimer() {
  stopTimer();
  setTimerMode(currentTimerMode);
}

function skipTimer() {
  stopTimer();
  timerTimeLeft = 1; // trigger standard completion sequence
  startTimer();
}

// Soundscapes setup
function initSoundscapes() {
  document.querySelectorAll('.sound-card').forEach(card => {
    card.addEventListener('click', (e) => {
      const type = e.currentTarget.getAttribute('data-sound');
      if (isPlayingSoundscape && currentSoundscape === type) {
        stopSoundscape();
      } else {
        startSoundscape(type);
      }
    });
  });

  // Soundscape volume control
  document.getElementById('soundscape-volume').addEventListener('input', (e) => {
    const val = e.target.value;
    document.getElementById('volume-val').innerText = `${val}%`;
    if (soundGainNode) {
      soundGainNode.gain.setValueAtTime(val / 100, audioCtx.currentTime);
    }
  });
}

// GPA & Habits tracker setup
function initHabits() {
  renderHabits();
  
  // Click habit save
  document.getElementById('add-habit-btn').addEventListener('click', () => {
    const name = document.getElementById('new-habit-input').value.trim();
    if (!name) return;

    const newHabit = {
      id: Date.now(),
      name,
      completedToday: false,
      streak: 0
    };

    state.habits.push(newHabit);
    saveState('aether_habits', state.habits);
    
    document.getElementById('new-habit-input').value = '';
    renderHabits();
    updateDashboardStats();
  });
}

function renderHabits() {
  const container = document.getElementById('habit-items-container');
  container.innerHTML = '';

  state.habits.forEach(habit => {
    const div = document.createElement('div');
    div.className = `habit-item ${habit.completedToday ? 'completed' : ''}`;
    div.innerHTML = `
      <div class="habit-check-left">
        <input type="checkbox" ${habit.completedToday ? 'checked' : ''} onchange="toggleHabit(${habit.id})">
        <span>${habit.name}</span>
      </div>
      <div class="streak-display">
        <i data-lucide="flame" style="width: 14px; height: 14px;"></i>
        <span>${habit.streak}d</span>
        <button class="task-delete-btn" style="margin-left: 8px" onclick="deleteHabit(${habit.id})">&times;</button>
      </div>
    `;
    container.appendChild(div);
  });
  
  if (state.habits.length === 0) {
    container.innerHTML = '<div class="empty-state">No habit trackers configured. Add some prompts!</div>';
  }
  
  lucide.createIcons();
}

function toggleHabit(id) {
  state.habits = state.habits.map(h => {
    if (h.id === id) {
      h.completedToday = !h.completedToday;
      if (h.completedToday) h.streak++;
      else h.streak = Math.max(0, h.streak - 1);
    }
    return h;
  });
  saveState('aether_habits', state.habits);
  renderHabits();
  updateDashboardStats();
}

function deleteHabit(id) {
  state.habits = state.habits.filter(h => h.id !== id);
  saveState('aether_habits', state.habits);
  renderHabits();
  updateDashboardStats();
}

// GPA calculator
function initGPA() {
  renderGPARows();
  
  document.getElementById('gpa-add-row-btn').addEventListener('click', () => {
    const newCourse = {
      id: Date.now(),
      name: "New Subject",
      grade: "A",
      credits: 3
    };
    state.gpaCourses.push(newCourse);
    saveState('aether_gpa', state.gpaCourses);
    renderGPARows();
  });
}

function renderGPARows() {
  const container = document.getElementById('gpa-rows-container');
  container.innerHTML = '';

  state.gpaCourses.forEach(course => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <input type="text" value="${course.name}" onchange="updateGPACourse(${course.id}, 'name', this.value)">
      </td>
      <td>
        <select onchange="updateGPACourse(${course.id}, 'grade', this.value)">
          <option value="A" ${course.grade === 'A' ? 'selected' : ''}>A (4.0)</option>
          <option value="B" ${course.grade === 'B' ? 'selected' : ''}>B (3.0)</option>
          <option value="C" ${course.grade === 'C' ? 'selected' : ''}>C (2.0)</option>
          <option value="D" ${course.grade === 'D' ? 'selected' : ''}>D (1.0)</option>
          <option value="F" ${course.grade === 'F' ? 'selected' : ''}>F (0.0)</option>
        </select>
      </td>
      <td>
        <input type="number" min="1" max="10" value="${course.credits}" onchange="updateGPACourse(${course.id}, 'credits', parseInt(this.value))">
      </td>
      <td style="text-align: center;">
        <button class="gpa-delete-row-btn" onclick="deleteGPACourse(${course.id})">&times;</button>
      </td>
    `;
    container.appendChild(tr);
  });

  calculateGPAValue();
}

function updateGPACourse(id, field, value) {
  state.gpaCourses = state.gpaCourses.map(c => {
    if (c.id === id) {
      c[field] = value;
    }
    return c;
  });
  saveState('aether_gpa', state.gpaCourses);
  calculateGPAValue();
}

function deleteGPACourse(id) {
  state.gpaCourses = state.gpaCourses.filter(c => c.id !== id);
  saveState('aether_gpa', state.gpaCourses);
  renderGPARows();
}

function calculateGPAValue() {
  const gradePoints = { 'A': 4, 'B': 3, 'C': 2, 'D': 1, 'F': 0 };
  let totalPoints = 0;
  let totalCredits = 0;
  
  state.gpaCourses.forEach(c => {
    const points = gradePoints[c.grade] ?? 4;
    totalPoints += points * c.credits;
    totalCredits += c.credits;
  });

  const finalGPA = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00";
  document.getElementById('gpa-score-display').innerText = finalGPA;
}

// Focus Analytics SVG Chart Engine
function renderAnalyticsChart() {
  const svg = document.getElementById('analytics-chart');
  svg.innerHTML = '';

  const maxVal = Math.max(...state.weeklyFocusSessions.map(s => s.minutes), 30);
  const chartHeight = 150;
  const chartWidth = 350;
  const paddingLeft = 30;
  const paddingBottom = 20;

  // Draw Gridlines & Y-Axis values
  const gridCount = 4;
  for (let i = 0; i <= gridCount; i++) {
    const gridY = 20 + ((chartHeight - 40) / gridCount) * i;
    const value = Math.round(maxVal - (maxVal / gridCount) * i);
    
    // Line
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', paddingLeft);
    line.setAttribute('y1', gridY);
    line.setAttribute('x2', chartWidth);
    line.setAttribute('y2', gridY);
    line.setAttribute('stroke', 'rgba(255, 255, 255, 0.05)');
    line.setAttribute('stroke-width', '1');
    svg.appendChild(line);

    // Label
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', paddingLeft - 8);
    text.setAttribute('y', gridY + 4);
    text.setAttribute('fill', '#64748b');
    text.setAttribute('font-size', '9');
    text.setAttribute('text-anchor', 'end');
    text.textContent = `${value}m`;
    svg.appendChild(text);
  }

  // Draw Bars & Labels
  const barWidth = 24;
  const colGap = (chartWidth - paddingLeft) / state.weeklyFocusSessions.length;
  
  state.weeklyFocusSessions.forEach((session, idx) => {
    const colX = paddingLeft + (colGap * idx) + (colGap - barWidth) / 2;
    const valHeight = (session.minutes / maxVal) * (chartHeight - 40);
    const colY = chartHeight - paddingBottom - valHeight;

    // Gradient bar
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', colX);
    rect.setAttribute('y', colY);
    rect.setAttribute('width', barWidth);
    rect.setAttribute('height', Math.max(valHeight, 4));
    rect.setAttribute('rx', '4');
    rect.setAttribute('fill', 'url(#chart-bar-gradient)');
    svg.appendChild(rect);

    // Day label
    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', colX + barWidth / 2);
    label.setAttribute('y', chartHeight - 5);
    label.setAttribute('fill', '#94a3b8');
    label.setAttribute('font-size', '10');
    label.setAttribute('text-anchor', 'middle');
    label.textContent = session.day;
    svg.appendChild(label);
  });

  // Inject gradient definition
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  defs.innerHTML = `
    <linearGradient id="chart-bar-gradient" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#2dd4bf" />
      <stop offset="100%" stop-color="#8b5cf6" />
    </linearGradient>
  `;
  svg.appendChild(defs);

  // Update Summary details
  const totalMinutes = state.weeklyFocusSessions.reduce((acc, curr) => acc + curr.minutes, 0);
  const tasksDone = state.tasks.filter(t => t.completed).length;
  const tasksTotal = state.tasks.length;
  
  const completionRate = tasksTotal > 0 ? Math.round((tasksDone / tasksTotal) * 100) : 0;
  document.getElementById('analytics-completion-rate').innerText = `${completionRate}%`;

  const totalHrs = (totalMinutes / 60).toFixed(1);
  document.getElementById('analytics-deepwork-ratio').innerText = `${totalHrs}h / 8.0h Target`;
}

// AI CONCIERGE BOT LOGIC
function initChatBot() {
  const sendBtn = document.getElementById('chat-send');
  const inputEl = document.getElementById('chat-input');
  
  sendBtn.addEventListener('click', handleUserChatMessage);
  inputEl.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleUserChatMessage();
  });
}

function sendSuggestedQuery(text) {
  document.getElementById('chat-input').value = text;
  handleUserChatMessage();
}

function handleUserChatMessage() {
  const inputEl = document.getElementById('chat-input');
  const text = inputEl.value.trim();
  if (!text) return;

  // Render User bubble
  appendMessageBubble('user', text);
  inputEl.value = '';

  // Render Typing Indicator
  const typingIndicator = appendTypingIndicator();

  // Process after mock lag delay
  setTimeout(() => {
    typingIndicator.remove();
    const botResponse = generateAgentAnswer(text);
    appendMessageBubble('system', botResponse);
  }, 1000);
}

function appendMessageBubble(sender, text) {
  const container = document.getElementById('chat-messages');
  const msgDiv = document.createElement('div');
  msgDiv.className = `message ${sender}`;
  msgDiv.innerHTML = `
    <div class="msg-bubble">${text}</div>
  `;
  container.appendChild(msgDiv);
  container.scrollTop = container.scrollHeight;
}

function appendTypingIndicator() {
  const container = document.getElementById('chat-messages');
  const msgDiv = document.createElement('div');
  msgDiv.className = `message system typing-indicator`;
  msgDiv.innerHTML = `
    <div class="msg-bubble" style="display: flex; gap: 4px; align-items: center; min-width: 50px;">
      <span class="typing-dot"></span>
      <span class="typing-dot" style="animation-delay: 0.15s"></span>
      <span class="typing-dot" style="animation-delay: 0.3s"></span>
    </div>
  `;
  container.appendChild(msgDiv);
  container.scrollTop = container.scrollHeight;
  return msgDiv;
}

// Styling rule for typing dot animation injected via stylesheet helper if missing
const style = document.createElement('style');
style.textContent = `
.typing-dot {
  width: 6px;
  height: 6px;
  background-color: var(--text-secondary);
  border-radius: 50%;
  display: inline-block;
  animation: typingBounce 1s infinite alternate;
}
@keyframes typingBounce {
  from { transform: translateY(0); opacity: 0.3; }
  to { transform: translateY(-4px); opacity: 1; }
}
`;
document.head.appendChild(style);

function generateAgentAnswer(query) {
  const normalized = query.toLowerCase();

  // Shortcut command: add task from chat e.g. "remind me to write chemistry summary"
  if (normalized.startsWith("remind me to ") || normalized.startsWith("task ")) {
    const taskTitle = query.slice(query.toLowerCase().indexOf("to ") + 3).trim();
    if (taskTitle) {
      const newTask = {
        id: Date.now(),
        title: taskTitle,
        category: "Homework",
        priority: "High",
        deadline: new Date(Date.now() + 86400000).toISOString().split('T')[0], // tomorrow
        completed: false
      };
      state.tasks.unshift(newTask);
      saveState('aether_tasks', state.tasks);
      renderTasks();
      updateDashboardStats();
      return `Sure! I have added that task for you:\n📚 **${taskTitle}** (Due tomorrow, marked as High priority). You can find it on your Task Board tab.`;
    }
  }

  // Shortcut command: take note from chat e.g. "note down photosynthesis formula: ..."
  if (normalized.startsWith("note down ") || normalized.startsWith("take note ")) {
    const parts = query.slice(10).split(":");
    const title = parts[0].trim();
    const content = parts.slice(1).join(":").trim() || "No content provided.";
    
    const months = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'];
    const now = new Date();
    const dateStr = `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;

    const newNote = {
      id: Date.now(),
      title: title || "AI Quick Note",
      content,
      tag: "AI Notes",
      date: dateStr
    };
    state.notes.unshift(newNote);
    saveState('aether_notes', state.notes);
    renderNotes();
    return `📝 Note created successfully:\n**${title}**\nYou can view and edit this in your **Notes & Deadlines** tab!`;
  }

  // Check matching academic topics
  for (const key in MOCK_DATA.academicAnswers) {
    if (normalized.includes(key)) {
      const entry = MOCK_DATA.academicAnswers[key];
      return `🎓 **[${entry.subject}] ${entry.title}**\n\n${entry.content}`;
    }
  }

  // Study schedules trigger
  if (normalized.includes("schedule") || normalized.includes("study plan") || normalized.includes("routine")) {
    const randomPlan = MOCK_DATA.schedules[Math.floor(Math.random() * MOCK_DATA.schedules.length)];
    let response = `📅 Here is a suggested study schedule: **${randomPlan.name}**\n*${randomPlan.description}*\n\n`;
    randomPlan.days.forEach(d => {
      response += `🗓️ **${d.day}**:\n`;
      d.tasks.forEach(t => {
        response += `  - ${t}\n`;
      });
    });
    return response;
  }

  // Study tips trigger
  if (normalized.includes("tip") || normalized.includes("advice") || normalized.includes("how to study")) {
    const randomTip = MOCK_DATA.studyTips[Math.floor(Math.random() * MOCK_DATA.studyTips.length)];
    return `💡 **Study Tip: ${randomTip.title}**\n\n${randomTip.desc}`;
  }

  // Fallback conversational responses
  const fallbacks = MOCK_DATA.defaultBotResponses;
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}
