// Initialize variables
let currentTimer = 0;
let isTimerRunning = false;

// DOM elements
const taskNameInput = document.getElementById('taskName');
const saveButton = document.getElementById('save');
const resumeButton = document.getElementById('resume');
const timerDisplay = document.getElementById('timerDisplay');
const taskList = document.getElementById('taskList');
const resetButton = document.getElementById('reset');

// Load saved tasks from local storage
const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];

// Function to update the timer display
function updateTimerDisplay() {
  timerDisplay.textContent = formatTime(currentTimer);
}

// Function to format time as HH:MM:SS
function formatTime(milliseconds) {
  const seconds = Math.floor((milliseconds / 1000) % 60);
  const minutes = Math.floor((milliseconds / (1000 * 60)) % 60);
  const hours = Math.floor(milliseconds / (1000 * 60 * 60));
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Function to start the timer
function startTimer() {
  const startTime = Date.now() - currentTimer;
  isTimerRunning = true;
  timerInterval = setInterval(() => {
    currentTimer = Date.now() - startTime;
    updateTimerDisplay();
  }, 1000);
}

// Function to stop the timer
function stopTimer() {
  clearInterval(timerInterval);
  isTimerRunning = false;
}

// Event listener for the save button
saveButton.addEventListener('click', () => {
  const taskName = taskNameInput.value.trim();
  if (!taskName) {
    alert('Please enter a task name.');
    return;
  }

  const elapsedTime = currentTimer;
  const task = { name: taskName, elapsedTime };

  savedTasks.push(task);
  localStorage.setItem('tasks', JSON.stringify(savedTasks));

  taskNameInput.value = '';
  updateTaskList();
});

// Event listener for the resume button
resumeButton.addEventListener('click', () => {
  startTimer();
  resumeButton.style.display = 'none';
});

// Event listener for the reset button
resetButton.addEventListener('click', () => {
  currentTimer = 0;
  updateTimerDisplay();
  stopTimer();
  resumeButton.style.display = 'inline';
});

// Function to update the task list
function updateTaskList() {
  taskList.innerHTML = '';
  savedTasks.forEach((task, index) => {
    const taskItem = document.createElement('li');
    taskItem.innerHTML = `
      <span class="task-name"><strong>${task.name}</strong></span>
      <span class="elapsed-time">${formatTime(task.elapsedTime)}</span>
      <button class="delete-button" onclick="deleteTask(${index})">Delete</button>
    `;
    taskList.appendChild(taskItem);

    const elapsedTimeSpan = taskItem.querySelector('.elapsed-time');
    elapsedTimeSpan.addEventListener('click', () => {
      const tempTextArea = document.createElement('textarea');
      tempTextArea.value = formatTime(task.elapsedTime);
      document.body.appendChild(tempTextArea);
      tempTextArea.select();
      document.execCommand('copy');
      document.body.removeChild(tempTextArea);
      elapsedTimeSpan.classList.add('clicked');
      setTimeout(() => {
        elapsedTimeSpan.classList.remove('clicked');
      }, 500);
    });
  });
}

// Event listener for the timer display (toggle start/stop functionality)
document.getElementById('timerDisplay').addEventListener('click', () => {
  // Toggle the timer state in the background script
  chrome.runtime.sendMessage({ cmd: isTimerRunning ? 'stopTimer' : 'startTimer', currentTimer });
});

// Initialize the timer display when the popup is opened
chrome.runtime.sendMessage({ cmd: 'getCurrentTimer', currentTimer }, (response) => {
  if (response.currentTimer) {
    currentTimer = response.currentTimer;
    if (isTimerRunning) {
      startTimer();
    }
    updateTimerDisplay();
  }
});

// Function to delete a task by index
function deleteTask(index) {
  savedTasks.splice(index, 1);
  localStorage.setItem('tasks', JSON.stringify(savedTasks));
  updateTaskList();
}

// Initialize the task list
updateTaskList();
