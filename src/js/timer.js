let countdownDate
let queuedTime = 0
let timerInterval
const removeInterval = () => {
  clearInterval(timerInterval)
  timerInterval = null
}
const setBaseTime = (time) => {
  let baseTime
  baseTime = time;
}
const startTimer = (baseTime, cb) => {
  if (!timerInterval) { // debounce multiple starts.
    if (queuedTime) {
      countdownDate = Date.now() + queuedTime
      queuedTime = 0
    } else {
      countdownDate = Date.now() + baseTime
    }
    timerInterval = setInterval(cb, 300)
  }
}
const getTime = () => {
  if (queuedTime) {
    return queuedTime
  } else if (countdownDate) {
    return countdownDate - Date.now()
  } else {
    return 0
  }
}
const pauseTimer = () => {
  queuedTime = getTime()
  removeInterval()
}
const resetTimer = (baseTime) => {
  queuedTime = baseTime
  removeInterval()
}
