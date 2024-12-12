let timer;
let minutes = 25;
let seconds = 0;
let cycleCount = 0;
let breakMinutes = 5;
let breakSeconds = 0;
let isBreakTime = false; // Track if it's break time
let isTimerRunning = false; // Track if timer is running

const timerElement = document.getElementById("timer");
const cycleLabel = document.getElementById("cycle-label");
const breakTimerLabel = document.getElementById("break-timer");
const startBtn = document.getElementById("start-btn");
const resetBtn = document.getElementById("reset-btn");

function updateTimer() {
  timerElement.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function updateBreakTimer() {
  breakTimerLabel.textContent = `${String(breakMinutes).padStart(2,"0")}:${String(breakSeconds).padStart(2, "0")}`;
}

function updateCycleLabel() {
  cycleLabel.textContent = `  ${cycleCount}`;
}

//when stat or pause button is clicked
function startPauseTimer() {
  if (!isTimerRunning) {
    isTimerRunning = true;
    startBtn.textContent = "Pause"; // Change the button to "Pause"

    timer = setInterval(() => {
      if (isBreakTime) {
        // Break timer logic
        if (breakSeconds === 0) {
            if (breakMinutes === 0) {
              clearInterval(timer);
              isTimerRunning = false;
              cycleCount++;
              updateCycleLabel();
              sendNotification("Break time is over! Back To Work.");
              resetWorkTimer(); // Immediately reset and start the work timer
              startPauseTimer();
            } else {
              breakMinutes--;
              breakSeconds = 59;
            }
        } else {
          breakSeconds--;
        }
        updateBreakTimer();
      } else {
        // Work timer logic
        if (seconds === 0) {
          if (minutes === 0) {
            clearInterval(timer);
            isTimerRunning = false;
            isBreakTime = true;
            sendNotification("Time for a little break!");
            resetBreakTimer(); // Immediately reset and start the break timer
            startPauseTimer();
          } else {
            minutes--;
            seconds = 59;
          }
        } else {
          seconds--;
        }
        updateTimer();
      }
    }, 1000);
  } else {
    clearInterval(timer);
    isTimerRunning = false;
    startBtn.textContent = "Resume"; // Change to "resume" when paused
  }
}

function resetWorkTimer() {
  minutes = 25;
  seconds = 0;
  isBreakTime = false;
  updateTimer();
}

function resetBreakTimer() {
  breakMinutes = 25;
  breakSeconds = 0;
  isBreakTime = true;
  updateBreakTimer();
}

function resetTimer() {
  clearInterval(timer);
  isTimerRunning = false;
  minutes = 25;
  seconds = 0;
  breakMinutes = 5;
  breakSeconds = 0;
  cycleCount = 0;
  isBreakTime = false;
  updateTimer();
  updateBreakTimer();
  updateCycleLabel();
  startBtn.textContent = "Start"; // Reset the button to "Start"
}

startBtn.addEventListener("click", startPauseTimer);
resetBtn.addEventListener("click", resetTimer);

updateTimer();
updateBreakTimer();
updateCycleLabel();

// Function to send a custom notification
function sendNotification(message) {
  if (Notification) {
    const notification = new Notification("Pomodoro Timer", {
      body: message,
      icon: "./assets/images/icon.ico", // Optional: Path to an icon
    });

    notification.onclick = function () {
        console.log("Notification clicked!");
        // Send an event to the main process to show the window
        ipcRenderer.send('notification-clicked');
    };
  }
}
