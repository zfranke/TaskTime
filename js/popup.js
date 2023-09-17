// Initialize variables
let startTime = 0;
let timerInterval;
let isTimerRunning = false;
let isTaskPaused = false; // Added variable to track task pause state
let currentTimer = 0; // Added variable to track current timer

// DOM elements
const taskNameInput = document.getElementById('taskName');
const startStopButton = document.getElementById('startStop');
const saveButton = document.getElementById('save');
const resumeButton = document.getElementById('resume'); // Added Resume button
const timerDisplay = document.getElementById('timerDisplay');
const taskList = document.getElementById('taskList');
const resetButton = document.getElementById('reset');

// Load saved tasks from local storage
const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];

// Function to resume a task
function resumeTask() {
  startTime = Date.now() - currentTimer;
  timerInterval = setInterval(updateTimer, 1000);
  startStopButton.textContent = 'Stop';
  isTimerRunning = true;
  isTaskPaused = false;
  resumeButton.style.display = 'none'; // Hide Resume button
  startStopButton.style.display = 'inline'; // Show Start button
}

// Function to copy text to clipboard
function copyToClipboard(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}


// Format time as HH:MM:SS
function formatTime(milliseconds) {
  const seconds = Math.floor((milliseconds / 1000) % 60);
  const minutes = Math.floor((milliseconds / (1000 * 60)) % 60);
  const hours = Math.floor(milliseconds / (1000 * 60 * 60));
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Function to start the stopwatch
function startStopwatch() {
  if (!isTimerRunning) {
    startTime = Date.now() - currentTimer;
    timerInterval = setInterval(updateTimer, 1000);
    startStopButton.textContent = 'Stop';
    isTimerRunning = true;
    isTaskPaused = false;
    resumeButton.style.display = 'none'; // Hide Resume button
  } else {
    clearInterval(timerInterval);
    startStopButton.textContent = 'Start';
    isTimerRunning = false;
    isTaskPaused = true;
    resumeButton.style.display = 'none'; // Show Resume button
    // Update currentTimer without accumulating
    currentTimer = Date.now() - startTime;
  }
}

// Event listener for the start/stop button
startStopButton.addEventListener('click', startStopwatch);

// Update the timer display
function updateTimer() {
  const currentTime = Date.now();
  currentTimer = currentTime - startTime;
  timerDisplay.textContent = formatTime(currentTimer);
}

// Function to delete a task by index
function deleteTask(index) {
  savedTasks.splice(index, 1);
  localStorage.setItem('tasks', JSON.stringify(savedTasks));
  updateTaskList();
}

// Event listener for the save button
saveButton.addEventListener('click', () => {
  const taskName = taskNameInput.value.trim();
  if (taskName === '') return; // Don't save empty task names

  const elapsedTime = currentTimer + (isTimerRunning ? Date.now() - startTime : 0);
  const task = { name: taskName, elapsedTime };

  // Save the task to local storage
  savedTasks.push(task);
  localStorage.setItem('tasks', JSON.stringify(savedTasks));

  // Clear input, reset timer, and update the task list
  taskNameInput.value = '';
  currentTimer = 0;
  timerDisplay.textContent = formatTime(currentTimer);
  clearInterval(timerInterval);
  startStopButton.textContent = 'Start';
  isTimerRunning = false;
  isTaskPaused = false;
  resumeButton.style.display = 'none'; // Hide Resume button
  startStopButton.style.display = 'inline'; // Show Start button

  // Update the task list
  updateTaskList();
});

// Event listener for the resume button
resumeButton.addEventListener('click', () => {
  resumeTask(); // Resume the task
});

// Event listener for the reset button
resetButton.addEventListener('click', () => {
  savedTasks.length = 0; // Clear the task list
  localStorage.setItem('tasks', JSON.stringify(savedTasks));
  updateTaskList();
  if (isTimerRunning) {
    clearInterval(timerInterval);
    isTimerRunning = false;
    isTaskPaused = false;
    startStopButton.textContent = 'Start';
    resumeButton.style.display = 'none'; // Hide Resume button
    startStopButton.style.display = 'inline'; // Show Start button
  }
});

// Update the task list
function updateTaskList() {
  taskList.innerHTML = '';
  savedTasks.forEach((task, index) => {
    const taskItem = document.createElement('li');
    taskItem.innerHTML = `
      <span class="task-name">${task.name}</span>
      <span class="elapsed-time">${formatTime(task.elapsedTime)}</span>
      <button class="delete-button" onclick="deleteTask(${index})">Delete</button>
    `;
    taskList.appendChild(taskItem);

    // Add a click event listener to the elapsed time for copying and applying the click effect
    const elapsedTimeSpan = taskItem.querySelector('.elapsed-time');
    elapsedTimeSpan.addEventListener('click', () => {
      copyToClipboard(formatTime(task.elapsedTime));
      // Apply the .clicked class to indicate it was clicked
      elapsedTimeSpan.classList.add('clicked');
      // Remove the .clicked class after a short delay (e.g., 500ms)
      setTimeout(() => {
        elapsedTimeSpan.classList.remove('clicked');
      }, 500);
    });
  });
}



// Event listener for the circular timer display
document.getElementById('timerDisplay').addEventListener('click', function() {
  startStopwatch(); // Call the startStopwatch function to toggle start/stop
});

// Initialize the task list
updateTaskList();
