// it's not clear that a WebWorker is warranted here. But the pomodoro timer I'm cloning uses them and it doesn't seem
// to complicate the design that much.
importScripts('./timer.js')
const timers = {};
const sendUpdate = (getTime, pauseTimer) => {
  let millisecondsRemaining = getTime()
  if (millisecondsRemaining < 0) {
    // removing this interval means we stop tracking time at all.
    // this is the place where we'd want to *keep going* so we could display how much time has elapsed since the end of
    // the pomodoro. Something like `-10:30` if you went to the bathroom or whatever before clicking stop. Might be nice.
    pauseTimer();
  }
  postMessage(millisecondsRemaining)
}

const handleStartMessage = (timerName) => {
  timers[timerName].startTimer(sendUpdate)
}
const handlePauseMessage = (timerName) => {
  const timer = timers[timerName]

  timer.pauseTimer()
  postMessage(timer.getTime())
}
const handleResetMessage = (timerName) => {
  // todo: should reset kill your current timer session?
  const timer = timers[timerName]

  timer.resetTimer()
  postMessage(timer.getTime())
}
const handleSetMessage = (timerName, time) => {
  if (timers[timerName]) {
    timers[timerName].setBaseTime(time)
  } else {
    timers[timerName] = Timer(time)
  }
}

// todo: build some better understood messages?
// not clear if this page is complicated enough to justify more than three constants...
const START = "START",
  PAUSE = "PAUSE",
  RESET = "RESET",
  SET = "SET"

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
    default:
    //todo: handle error case
  }
}

