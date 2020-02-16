// todo: send a notification when time is up
// todo: change the title of the page when time is up.
import { askNotificationPermission, sendNotification } from './notifications.js'


let activeTimer = 'POMODORO';

function toMillis (minutes) {
  return minutes * 60 * 1000
}

const ORIGINAL_DOCUMENT_TITLE = document.title
const timerDiv = document.getElementById('timer')

function setupMinutesInput (timerWorker, elementId, timerName, initialValue) {
  const minutesInput = document.getElementById(elementId)
  minutesInput.value = initialValue
  minutesInput.addEventListener('input', function () {
    timerWorker.postMessage(['SET', timerName, toMillis(minutesInput.value)])
    timerWorker.postMessage(['RESET', timerName])
  })

  // initialize inputs with starting value
  timerWorker.postMessage(['SET', timerName, toMillis(initialValue)])
}

function setupSettingsControls (timerWorker) {
  const startingPomodoroMinutes = 25
  const startingShortBreakMinutes = 5
  const startingLongBreakMinutes = 30

  setupMinutesInput(timerWorker, 'pomodoro-time', 'POMODORO', startingPomodoroMinutes)
  setupMinutesInput(timerWorker, 'short-break-time', 'SHORT_BREAK', startingShortBreakMinutes)
  setupMinutesInput(timerWorker, 'long-break-time', 'LONG_BREAK', startingLongBreakMinutes)
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
    // todo: there's a great opportunity to make these click handlers more generic.
    // todo: figure out what to do about SET not behaving as expected. Would like new SETs to send updates to the unstarted UI if that timer is active.
    timerWorker.postMessage(['RESET', activeTimer]) // ugly hack
    activeTimer = 'POMODORO'
    timerWorker.postMessage(['RESET', activeTimer]) // ugly hack
  }
  document.getElementById('pomodoro-button').addEventListener('click', handlePomodoroClick)

  const handleShortBreakClick = (e) => {
    timerWorker.postMessage(['RESET', activeTimer]) // ugly hack
    activeTimer = 'SHORT_BREAK'
    timerWorker.postMessage(['RESET', activeTimer]) // ugly hack
  }
  document.getElementById('short-break-button').addEventListener('click', handleShortBreakClick)

  const handleLongBreakClick = (e) => {
    timerWorker.postMessage(['RESET', activeTimer]) // ugly hack
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
