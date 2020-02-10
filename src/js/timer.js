// it's not clear that a WebWorker is warranted here. But the pomodoro timer I'm cloning uses them and it doesn't seem
// to complicate the design that much.
// todo: Make a Timer class
let countdownDate
let remainingTime = 0

//todo: baseTime should be stored globally up here ^ instead of passed around.
const startTimer = (baseTime) => {
  if (remainingTime) {
    countdownDate = Date.now() + remainingTime
    remainingTime = 0
  } else {
    countdownDate = Date.now() + baseTime
  }
}
const getTime = () => {
  if (remainingTime) {
    return remainingTime
  } else if (countdownDate) {
    return countdownDate - Date.now()
  } else {
    return 0
  }
}
const pauseTimer = () => {
  remainingTime = getTime()
  return remainingTime
}
const resetTimer = (baseTime) => {
  remainingTime = baseTime
}
// end of timer class

let timerInterval
const removeInterval = () => {
  clearInterval(timerInterval)
  timerInterval = null
}

const sendUpdate = () => {
  let millisecondsRemaining = getTime()
  if (millisecondsRemaining < 0) {
    // removing this interval means we stop tracking time at all.
    // this is the place where we'd want to *keep going* so we could display how much time has elapsed since the end of
    // the pomodoro. Something like `-10:30` if you went to the bathroom or whatever before clicking stop. Might be nice.
    removeInterval()
  }
  postMessage(millisecondsRemaining)
}

const handleStartMessage = (baseTime) => {
  if (!timerInterval) {
    startTimer(baseTime)
    timerInterval = setInterval(sendUpdate, 300)
  }
}
const handlePauseMessage = () => {
  pauseTimer()
  removeInterval()
  postMessage(getTime())
}
const handleResetMessage = (baseTime) => {
  // todo: should reset kill your current timer session?
  resetTimer(baseTime)
  removeInterval()
  postMessage(getTime())
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

