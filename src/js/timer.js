const Timer = function (t) {
  if (t <= 0 || !t) {
    throw new Error("No time provided to Timer")
  }

  let countdownDate
  let queuedTime = 0
  let timerInterval
  let baseTime = t

  const removeInterval = () => {
    clearInterval(timerInterval)
    timerInterval = null
  }
  const setBaseTime = (time) => {
    baseTime = time
  }
  const getBaseTime = () => {
    return baseTime;
  }
  const startTimer = (cb) => {
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
  const resetTimer = () => {
    queuedTime = baseTime
    removeInterval()
  }

  return {
    startTimer,
    getTime,
    pauseTimer,
    resetTimer,
    setBaseTime,
    getBaseTime
  }
}
