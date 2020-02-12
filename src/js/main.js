// todo: send a notification when time is up
// todo: change the title of the page when time is up.
import { askNotificationPermission, sendNotification } from './notifications.js'

let pomodoroMinutes = 25
let shortBreakMinutes = 5
let longBreakMinutes = 30

let activeTimer;

function toMillis (minutes) {
  return minutes * 60 * 1000
}

const ORIGINAL_DOCUMENT_TITLE = document.title
const timerDiv = document.getElementById('timer')

function setupSettingsControls (timerWorker) {
  const pomodoroMinutesInput = document.getElementById('pomodoro-time')
  pomodoroMinutesInput.value = pomodoroMinutes
  pomodoroMinutesInput.addEventListener('input', function () {
    pomodoroMinutes = pomodoroMinutesInput.value;
    timerWorker.postMessage(['SET', 'POMODORO', toMillis(pomodoroMinutes)])
  })

  const shortBreakMinutesInput = document.getElementById('short-break-time')
  shortBreakMinutesInput.value = shortBreakMinutes
  shortBreakMinutesInput.addEventListener('input', function () {
    shortBreakMinutes = shortBreakMinutesInput.value;
    timerWorker.postMessage(['SET', 'SHORT_BREAK', toMillis(shortBreakMinutes)])
  })

  const longBreakMinutesInput = document.getElementById('long-break-time')
  longBreakMinutesInput.value = longBreakMinutes
  longBreakMinutesInput.addEventListener('input', function () {
    longBreakMinutes = shortBreakMinutesInput.value;
    timerWorker.postMessage(['SET', 'LONG_BREAK', toMillis(longBreakMinutes)])
  })

  // init
  timerWorker.postMessage(['SET', 'POMODORO', pomodoroMilliseconds])
  timerWorker.postMessage(['SET', 'SHORT_BREAK', toMillis(shortBreakMinutes)])
  timerWorker.postMessage(['SET', 'LONG_BREAK', toMillis(longBreakMinutes)])
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
    activeTimer = 'POMODORO'
    timerWorker.postMessage(['RESET', activeTimer]) // ugly hack
  }
  document.getElementById('pomodoro-button').addEventListener('click', handlePomodoroClick)

  const handleShortBreakClick = (e) => {
    activeTimer = 'SHORT_BREAK'
    timerWorker.postMessage(['RESET', activeTimer]) // ugly hack
  }
  document.getElementById('short-break-button').addEventListener('click', handleShortBreakClick)

  const handleLongBreakClick = (e) => {
    activeTimer = 'LONG_BREAK'
    timerWorker.postMessage(['RESET', activeTimer]) // ugly hack
  }
  document.getElementById('long-break-button').addEventListener('click', handleLongBreakClick)

  const handleStartClick = (event) => {
    timerWorker.postMessage(['START', activeTimer])

    if (Notification.permission === 'default') {
      askNotificationPermission()
    }
  }
  document.getElementById('start-button').addEventListener('click', handleStartClick)

  const handlePauseClick = (event) => {
    // clicking pause immediately after page refresh has ill-defined behavior.
    timerWorker.postMessage(['PAUSE', activeTimer])
  }
  document.getElementById('pause-button').addEventListener('click', handlePauseClick)

  const handleResetClick = (event) => {
    timerWorker.postMessage(['RESET', activeTimer])
    document.title = ORIGINAL_DOCUMENT_TITLE
  }
  document.getElementById('reset-button').addEventListener('click', handleResetClick)
}

if (window.Worker) {
  const timerWorker = new Worker('js/timerWorker.js')
  setupTimerControls(timerWorker)
  setupSettingsControls(timerWorker)
} else {
  // todo: Web workers aren't really required, it just makes things less goofy.
  // A friendly fallback strategy would be nice.
  document.getElementById('timer-layout').innerHTML = 'Web Workers are required.'
}
