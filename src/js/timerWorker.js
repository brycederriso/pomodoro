// it's not clear that a WebWorker is warranted here. But the pomodoro timer I'm cloning uses them and it doesn't seem
// to complicate the design that much.
importScripts('./timer.js')

const sendUpdate = () => {
  let millisecondsRemaining = getTime()
  if (millisecondsRemaining < 0) {
    // removing this interval means we stop tracking time at all.
    // this is the place where we'd want to *keep going* so we could display how much time has elapsed since the end of
    // the pomodoro. Something like `-10:30` if you went to the bathroom or whatever before clicking stop. Might be nice.
    timer.pauseTimer();
  }
  postMessage(millisecondsRemaining)
}

const handleStartMessage = (baseTime) => {
  timer.startTimer(baseTime, sendUpdate)
}
const handlePauseMessage = () => {
  timer.pauseTimer()
  postMessage(timer.getTime())
}
const handleResetMessage = (baseTime) => {
  // todo: should reset kill your current timer session?
  timer.resetTimer(baseTime)
  postMessage(timer.getTime())
}

// todo: build some better understood messages?
// not clear if this page is complicated enough to justify more than three constants...
const START = "START"
const PAUSE = "PAUSE"
const RESET = "RESET"

onmessage = (event) => {
  // todo: it looks like postMessage takes any JS object. So probably shouldn't use an array.
  switch (event.data[0]) {
    case START:
      handleStartMessage(event.data[1])
      break
    case PAUSE:
      handlePauseMessage()
      break
    case RESET:
      handleResetMessage(event.data[1])
      break
    default:
    //todo: handle error case
  }
}

