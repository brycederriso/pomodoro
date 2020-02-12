// todo: send a notification when time is up
// todo: change the title of the page when time is up.
import { askNotificationPermission, sendNotification } from './notifications.js'

let pomodoroMinutes = 25
let shortBreakMinutes = 5
let longBreakMinutes = 30

function toMillis (minutes) {
  return minutes * 60 * 1000
}

let pomodoroMilliseconds = toMillis(pomodoroMinutes);
const ORIGINAL_DOCUMENT_TITLE = document.title
const timerDiv = document.getElementById('timer')

function setupSettingsControls (timerWorker) {
  const pomodoroMinutesInput = document.getElementById('pomodoro-time')
  pomodoroMinutesInput.value = pomodoroMinutes
  pomodoroMinutesInput.addEventListener('input', function () {
    pomodoroMinutes = pomodoroMinutesInput.value;
    timerWorker.postMessage(['RESET', toMillis(pomodoroMinutes)])
  })

  // todo: Passing a Dumb reset message causes the timer to reset even if it's running.
  const shortBreakMinutesInput = document.getElementById('short-break-time')
  shortBreakMinutesInput.value = shortBreakMinutes
  shortBreakMinutesInput.addEventListener('input', function () {
    shortBreakMinutes = shortBreakMinutesInput.value;
    timerWorker.postMessage(['RESET', toMillis(shortBreakMinutes)])
  })

  document.getElementById('long-break-time').value = longBreakMinutes

}

const setTimerDisplay = (milliseconds) => {
  const minutes = String(Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60))).padStart(1, '0')
  const seconds = String(Math.floor((milliseconds % (1000 * 60)) / 1000)).padStart(2, '0')

  timerDiv.innerHTML = `${minutes}:${seconds}`
}

const updateDisplay = (millisecondsRemaining) => {
  setTimerDisplay(millisecondsRemaining)
  if (millisecondsRemaining < 0) {
    // time's up
    timerDiv.innerHTML = 'EXPIRED'
    document.title = `Time's up!`
    sendNotification(`Time's up!`)
  }
}

const setupTimerControls = (timerWorker) => {
  timerWorker.onmessage = (event) => {
    updateDisplay(event.data)
  }

  const handlePomodoroClick = (e) => {
    timerWorker.postMessage(['RESET', pomodoroMilliseconds])
  }
  document.getElementById('pomodoro-button').addEventListener('click', handlePomodoroClick)

  const handleShortBreakClick = (e) => {
    timerWorker.postMessage(['RESET', 5 * 60 * 1000])
  }
  document.getElementById('short-break-button').addEventListener('click', handleShortBreakClick)

  const handleLongBreakClick = (e) => {
    timerWorker.postMessage(['RESET', 30 * 60 * 1000])
  }
  document.getElementById('long-break-button').addEventListener('click', handleLongBreakClick)

  const handleStartClick = (event) => {
    timerWorker.postMessage(['START', pomodoroMilliseconds])

    if (Notification.permission === 'default') {
      askNotificationPermission()
    }
  }
  document.getElementById('start-button').addEventListener('click', handleStartClick)

  const handlePauseClick = (event) => {
    // clicking pause immediately after page refresh has ill-defined behavior.
    timerWorker.postMessage(['PAUSE'])
  }
  document.getElementById('pause-button').addEventListener('click', handlePauseClick)

  const handleResetClick = (event) => {
    timerWorker.postMessage(['RESET', pomodoroMilliseconds])
    document.title = ORIGINAL_DOCUMENT_TITLE
  }
  document.getElementById('reset-button').addEventListener('click', handleResetClick)
}

if (window.Worker) {
  const timerWorker = new Worker('js/timer.js')
  setupTimerControls(timerWorker)
  setupSettingsControls(timerWorker)
} else {
  // todo: Web workers aren't really required, it just makes things less goofy.
  // A friendly fallback strategy would be nice.
  document.getElementById('timer-layout').innerHTML = 'Web Workers are required.'
}
