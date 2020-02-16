// todo: send a notification when time is up
// todo: change the title of the page when time is up.
import { askNotificationPermission, sendNotification } from './notifications.js'

const POMODORO_TIMER_NAME = 'POMODORO'
const SHORT_BREAK_TIMER_NAME = 'SHORT_BREAK'
const LONG_BREAK_TIMER_NAME = 'LONG_BREAK'

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

  setupMinutesInput(timerWorker, 'pomodoro-time', POMODORO_TIMER_NAME, startingPomodoroMinutes)
  setupMinutesInput(timerWorker, 'short-break-time', SHORT_BREAK_TIMER_NAME, startingShortBreakMinutes)
  setupMinutesInput(timerWorker, 'long-break-time', LONG_BREAK_TIMER_NAME, startingLongBreakMinutes)
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
  let activeTimer = POMODORO_TIMER_NAME;

  timerWorker.onmessage = (event) => {
    updateDisplay(event.data)
  }

  function createTimerClickHandler (timer) {
    return function (e) {
      timerWorker.postMessage(['RESET', activeTimer]) // ugly hack
      activeTimer = timer
      timerWorker.postMessage(['RESET', activeTimer]) // ugly hack
    }
  }

  document.getElementById('pomodoro-button').addEventListener('click', createTimerClickHandler(POMODORO_TIMER_NAME))
  document.getElementById('short-break-button').addEventListener('click', createTimerClickHandler(SHORT_BREAK_TIMER_NAME))
  document.getElementById('long-break-button').addEventListener('click', createTimerClickHandler(LONG_BREAK_TIMER_NAME))

  const handleStartClick = (event) => {
    timerWorker.postMessage(['START', activeTimer])

    if (Notification.permission === 'default') {
      askNotificationPermission()
    }
  }
  document.getElementById('start-button').addEventListener('click', handleStartClick)

  const handlePauseClick = (event) => {
    // todo: clicking pause immediately after page refresh is buggy -- it resets the timer to 0:00
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
  // todo: It's not clear if webworkers are required -- maybe it'll help save power when the tab isn't active?
  // todo: From above, go look at web worker lifecycle hooks and what those do
  // A friendly fallback strategy would be nice.
  document.getElementById('timer-layout').innerHTML = 'Web Workers are required.'
}
