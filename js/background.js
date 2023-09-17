let timerInterval;
let startTime = 0;
let isTimerRunning = false;

// Handle messages from the popup script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.cmd === 'startTimer') {
    if (!isTimerRunning) {
      startTime = Date.now() - (request.currentTimer || 0);
      timerInterval = setInterval(updateTimer, 1000);
      isTimerRunning = true;
    }
  } else if (request.cmd === 'stopTimer') {
    clearInterval(timerInterval);
    isTimerRunning = false;
  } else if (request.cmd === 'getCurrentTimer') {
    sendResponse({ currentTimer: isTimerRunning ? (Date.now() - startTime) : request.currentTimer });
  }
});

// Function to update the timer
function updateTimer() {
  const currentTime = Date.now();
  const currentTimer = currentTime - startTime;
  // Send the current timer value to the popup script
  chrome.runtime.sendMessage({ cmd: 'updateTimerDisplay', currentTimer });
}
