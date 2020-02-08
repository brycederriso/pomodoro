let pomodoroMinutes = 1;
let pomodoroMilliseconds = pomodoroMinutes * 60 * 1000;

const timerDiv = document.getElementById("timer");
const setTimerDisplay = (milliseconds) => {
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);

  timerDiv.innerHTML = `${minutes}:${seconds}`;
}

// todo: Make a Timer class
let countdownDate;
let remainingTime = 0;
const startTimer = () => {
  if (remainingTime) {
    countdownDate = Date.now() + remainingTime;
    remainingTime = 0;
  } else {
    countdownDate = Date.now() + pomodoroMilliseconds;
  }
}
const getTime = () => {
  if (remainingTime) {
    return remainingTime
  } else if (countdownDate) {
    return countdownDate - Date.now();
  } else {
    return 0;
  }
}
const pauseTimer = () => {
  remainingTime = getTime();
  return remainingTime;
}
const resetTimer = (baseTime) => {
  remainingTime = baseTime;
}
// end of timer class

let timerInterval;
const removeInterval = () => {
  clearInterval(timerInterval);
  timerInterval = null;
}

const updateDisplay = () => {
  let distance = getTime();
  setTimerDisplay(distance)

  if (distance < 0) {
    removeInterval();
    timerDiv.innerHTML = "EXPIRED";
  }
}

let handleStartClick = (event) => {
  if (!timerInterval) {
    startTimer();
    timerInterval = setInterval(updateDisplay, 1000);
  }
}

let handlePauseClick = (event) => {
  pauseTimer();
  removeInterval();
  setTimerDisplay(getTime());
}
let handleResetClick = (event) => {
  resetTimer(pomodoroMilliseconds);
  removeInterval();
  setTimerDisplay(getTime());
}

//set countdown
document.getElementById("start-button").addEventListener("click", handleStartClick);
document.getElementById("pause-button").addEventListener("click", handlePauseClick);
document.getElementById("reset-button").addEventListener("click", handleResetClick);
