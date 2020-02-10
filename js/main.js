// todo: send a notification when time is up
// todo: change the title of the page when time is up.
let pomodoroMinutes = 1
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
  }
}

switch (Notification.permission) {
  case "default": // user hasn't been asked
    // FIXME: requestPermission(cb) is deprecated.
    Notification.requestPermission(function (status) {
      console.log('Notification permission status:', status)
    })
    break
  case "granted": // user has been asked and allowed it.
    break
  case "denied": // user doesn't want it.
    break
  default: // do nothing if Notification.permission isn't a thing.
}

function askNotificationPermission () {
  // function to actually ask the permissions
  function handlePermission (permission) {
    // Whatever the user answers, we make sure Chrome stores the information
    if (!('permission' in Notification)) {
      Notification.permission = permission
    }

    // set the button to shown or hidden, depending on what the user answers
    if (Notification.permission === 'denied' || Notification.permission === 'default') {
      notificationBtn.style.display = 'block'
    } else {
      notificationBtn.style.display = 'none'
    }
  }

  // Let's check if the browser supports notifications
  if (!('Notification' in window)) {
    console.log("This browser does not support notifications.")
  } else {
    if (checkNotificationPromise()) {
      Notification.requestPermission()
        .then((permission) => {
          handlePermission(permission)
        })
    } else {
      Notification.requestPermission(function (permission) {
        handlePermission(permission)
      })
    }
  }
}

if (window.Worker) {
  const timerWorker = new Worker('js/timer.js')
  timerWorker.onmessage = (event) => {
    updateDisplay(event.data)
  }

  const handleStartClick = (event) => {
    timerWorker.postMessage(['START', pomodoroMilliseconds])
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

