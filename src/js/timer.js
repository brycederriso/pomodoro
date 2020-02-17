// todo: there's an opportunity to debounce this so that it doesn't send no-op updates to the display.
/*
Right now, this will flash something like 0:59 ~3 times in a second, even though there's no change!
To handle this, we'll need some way to compare the *last* output to the current output.
Shouldn't be too hard with a straight string comparison, but it will involve moving the display code into the timer object.

May want a configurable resolution setting -- we're fundamentally dealing with milliseconds here, but only care about per-second updates.

Instead of moving the display code into the timer object, we could just fix the resolution of the timer which would involve:
1. converting milliseconds to seconds
2. rounding down to the nearest second
3. converting back
4. Comparing this value to the previous value to see if they've changed

It's likely that things will be left with just a per second update but who knows!
 */
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
      // todo: This is incredibly gross.
      //  I have to do it because sendUpdate (the cb) was relying on lexically scoped timer to get and pause.
      //  That doesn't work when we deal with multiple timer objects.
      //  I do feel like at some point I'd like to provide custom "stop" conditions for a timer
      timerInterval = setInterval(cb.bind(undefined, getTime, pauseTimer), 300)
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
