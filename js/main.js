// todo: send a notification when time is up
// todo: change the title of the page when time is up.
import {askNotificationPermission, sendNotification} from '/pomodoro/js/notifications.js'

let pomodoroMinutes = .25
let pomodoroMilliseconds = pomodoroMinutes * 60 * 1000
const ORIGINAL_DOCUMENT_TITLE = document.title
const timerDiv = document.getElementById('timer')
const setTimerDisplay = (milliseconds) => {
  const minutes = String(Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0')
  const seconds = String(Math.floor((milliseconds % (1000 * 60)) / 1000)).padStart(2, '0')

  timerDiv.innerHTML = `${minutes}:${seconds}`
}

const updateDisplay = (millisecondsRemaining) => {
  setTimerDisplay(millisecondsRemaining)
  if (millisecondsRemaining < 0) {
    // time's up
    timerDiv.innerHTML = 'EXPIRED'
    document.title = `Time's up!`
    sendNotification(`Time's up!`);
  }
}


if (window.Worker) {
  const timerWorker = new Worker('js/timer.js')
  timerWorker.onmessage = (event) => {
    updateDisplay(event.data)
  }

  const handleStartClick = (event) => {
    timerWorker.postMessage(['START', pomodoroMilliseconds])

    if (Notification.permission === 'default') {
      askNotificationPermission()
    }

  }
  const handlePauseClick = (event) => {
    // clicking pause immediately after page refresh has ill-defined behavior.
    timerWorker.postMessage(['PAUSE'])
  }
  const handleResetClick = (event) => {
    timerWorker.postMessage(['RESET', pomodoroMilliseconds])
    document.title = ORIGINAL_DOCUMENT_TITLE
  }

  document.getElementById('start-button').addEventListener('click', handleStartClick)
  document.getElementById('pause-button').addEventListener('click', handlePauseClick)
  document.getElementById('reset-button').addEventListener('click', handleResetClick)
} else {
  // todo: Web workers aren't really required, it just makes things less goofy.
  // A friendly fallback strategy would be nice.
  document.getElementById('timer-layout').innerHTML = 'Web Workers are required.'
}

