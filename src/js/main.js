import { askNotificationPermission, sendNotification } from './notifications.js'

// I don't actually care what the values of these string constants are. Maybe something like a Symbol would be better?
const POMODORO_TIMER_NAME = 'POMODORO'
const SHORT_BREAK_TIMER_NAME = 'SHORT_BREAK'
const LONG_BREAK_TIMER_NAME = 'LONG_BREAK'

function setupSettingsControls (timerWorker) {
  const startingPomodoroMinutes = 25
  const startingShortBreakMinutes = 10
  const startingLongBreakMinutes = 30

  function toMillis (minutes) {
    return minutes * 60 * 1000
  }

  function setupMinutesInput (timerWorker, elementId, timerName, initialValue) {
    const minutesInput = document.getElementById(elementId)
    minutesInput.value = initialValue
    minutesInput.addEventListener('input', function () {
      timerWorker.postMessage(['SET', timerName, toMillis(minutesInput.value)])
    })

    // initialize inputs with starting value
    timerWorker.postMessage(['SET', timerName, toMillis(initialValue)])
  }

  setupMinutesInput(timerWorker, 'pomodoro-time', POMODORO_TIMER_NAME, startingPomodoroMinutes)
  setupMinutesInput(timerWorker, 'short-break-time', SHORT_BREAK_TIMER_NAME, startingShortBreakMinutes)
  setupMinutesInput(timerWorker, 'long-break-time', LONG_BREAK_TIMER_NAME, startingLongBreakMinutes)
}

function setupTimerControls (timerWorker) {
  const ORIGINAL_DOCUMENT_TITLE = document.title

  function updateDisplay (millisecondsRemaining) {
    const timerDiv = document.getElementById('timer')

    function minutesSecondsString (milliseconds) {
      // this only works with milliseconds >= 0
      const minutes = String(Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60))).padStart(1, '0')
      const seconds = String(Math.floor((milliseconds % (1000 * 60)) / 1000)).padStart(2, '0')

      return `${minutes}:${seconds}`
    }

    timerDiv.innerHTML = minutesSecondsString(millisecondsRemaining)

    if (millisecondsRemaining < 0) { // time's up
      timerDiv.innerHTML = `Time's up!`
      document.title = `Time's up!`
      sendNotification(`Time's up!`)
    }
  }

  function recordCompletion (millisecondsRemaining) {
    if (millisecondsRemaining <= 0) {
      // attach an OL to the web page
      const completionsList = document.getElementById('completions-list')
      const newCompletion = document.createElement('li')
      newCompletion.innerText = `done.`
      completionsList.insertBefore(newCompletion, completionsList.firstChild)
    }
  }

  timerWorker.onmessage = (event) => {
    updateDisplay(event.data)
    recordCompletion(event.data)
  }

  function setupTimerNameHandlers () {
    function createTimerClickHandler (timer) {
      return function (e) {
        timerWorker.postMessage(['ACTIVATE', timer])
        document.title = ORIGINAL_DOCUMENT_TITLE
      }
    }
    document.getElementById('pomodoro-button').addEventListener('click', createTimerClickHandler(POMODORO_TIMER_NAME))
    document.getElementById('short-break-button').addEventListener('click', createTimerClickHandler(SHORT_BREAK_TIMER_NAME))
    document.getElementById('long-break-button').addEventListener('click', createTimerClickHandler(LONG_BREAK_TIMER_NAME))
  }

  function setupStartHandler () {
    const handleStartClick = (event) => {
      timerWorker.postMessage(['START'])

      if (Notification.permission === 'default') {
        askNotificationPermission()
      }
    }
    document.getElementById('start-button').addEventListener('click', handleStartClick)
  }

  function setupPauseHandler () {
    function handlePauseClick (event) {
      timerWorker.postMessage(['PAUSE'])
    }
    document.getElementById('pause-button').addEventListener('click', handlePauseClick)
  }

  function setupResetHandler () {
    const handleResetClick = (event) => {
      timerWorker.postMessage(['RESET'])
      document.title = ORIGINAL_DOCUMENT_TITLE
    }
    document.getElementById('reset-button').addEventListener('click', handleResetClick)
  }

  setupTimerNameHandlers()
  setupStartHandler()
  setupPauseHandler()
  setupResetHandler()
}


if (window.Worker) {
  const timerWorker = new Worker('js/timerWorker.js')
  setupTimerControls(timerWorker)
  setupSettingsControls(timerWorker)

  // Activate the Pomodoro Timer by default
  timerWorker.postMessage(['ACTIVATE', POMODORO_TIMER_NAME])
} else {
  // todo: It's not clear if webworkers are required -- maybe it'll help save power when the tab isn't active?
  // todo: From above, go look at web worker lifecycle hooks and what those do
  // A friendly fallback strategy would be nice.
  document.getElementById('timer-layout').innerHTML = 'Web Workers are required.'
}
