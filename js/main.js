let pomodoroMinutes = 1
let pomodoroMilliseconds = pomodoroMinutes * 60 * 1000

const timerDiv = document.getElementById('timer')
const setTimerDisplay = (milliseconds) => {
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000)

  // todo: fix the display so that there are leading 0's on my timer.
  timerDiv.innerHTML = `${minutes}:${seconds}`
}
const updateDisplay = (distance) => {
  setTimerDisplay(distance)

  if (distance < 0) {
    removeInterval()
    timerDiv.innerHTML = 'EXPIRED'
  }
}

if (window.Worker) {
  const timerWorker = new Worker('js/timer.js');
  timerWorker.onmessage = (event) => {
    updateDisplay(event.data);
  };

  const handleStartClick = (event) => {
    timerWorker.postMessage(['START', pomodoroMilliseconds])
  }
  const handlePauseClick = (event) => {
    timerWorker.postMessage(['PAUSE']);
  }
  const handleResetClick = (event) => {
    timerWorker.postMessage(['RESET', pomodoroMilliseconds]);
  }

  document.getElementById('start-button').addEventListener('click', handleStartClick)
  document.getElementById('pause-button').addEventListener('click', handlePauseClick)
  document.getElementById('reset-button').addEventListener('click', handleResetClick)
} else {
  // todo: Web workers aren't really required, it just makes things less goofy.
  // A friendly fallback strategy would be nice.
  document.getElementById('timer-layout').innerHTML = 'Web Workers are required.'
}

