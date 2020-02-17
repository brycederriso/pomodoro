// it's not clear that a WebWorker is warranted here. But the pomodoro timer I'm cloning uses them and it doesn't seem
// to complicate the design that much.
importScripts('./timer.js')
const timers = {}
let activeTimer = null

const sendUpdate = (getTime, pauseTimer) => {
  let millisecondsRemaining = getTime()
  if (millisecondsRemaining < 0) {
    // removing this interval means we stop tracking time at all.
    // this is the place where we'd want to *keep going* so we could display how much time has elapsed since the end of
    // the pomodoro. Something like `-10:30` if you went to the bathroom or whatever before clicking stop. Might be nice.
    pauseTimer()
  }
  postMessage(millisecondsRemaining)
}

const handleStartMessage = () => {
  timers[activeTimer].startTimer(sendUpdate)
}
const handlePauseMessage = () => {
  const timer = timers[activeTimer]

  timer.pauseTimer()
  postMessage(timer.getTime())
}
const handleResetMessage = () => {
  // todo: should reset kill your current timer session?
  // todo: Reset only the active timer.
  if (timers[activeTimer]) {
    const timer = timers[activeTimer]
    timer.resetTimer()
    postMessage(timer.getTime())
  }
}
const handleSetMessage = (timerName, time) => {
  if (timers[timerName]) {
    timers[timerName].setBaseTime(time)
  } else {
    timers[timerName] = Timer(time)
  }
}

function handleActivateMessage (timerName) {
  if (timers[timerName]) {
    handleResetMessage() // effectively, clear our callback function!
    activeTimer = timerName
    handleResetMessage() // reset our active timer to its base time
  } else {
    handleResetMessage()
    activeTimer = timerName
    timers[timerName] = Timer(10 * 60 * 1000)
    handleResetMessage()
  }
}

// todo: build some better understood messages?
const START = "START",
  PAUSE = "PAUSE",
  RESET = "RESET",
  SET = "SET",
  ACTIVATE = 'ACTIVATE'

onmessage = (event) => {
  // todo: it looks like postMessage takes any JS object. So probably shouldn't use an array.
  switch (event.data[0]) {
    case START:
      handleStartMessage(event.data[1])
      break
    case PAUSE:
      handlePauseMessage(event.data[1])
      break
    case RESET:
      handleResetMessage(event.data[1])
      break
    case SET:
      handleSetMessage(event.data[1], event.data[2])
      break
    case ACTIVATE:
      handleActivateMessage(event.data[1])
      break
    default:
    //todo: handle error case
  }
}

