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
const Timer = function ({
  onIncrement,
  continueOn,
  baseTime
}) {
  if (baseTime <= 0 || !baseTime) {
    throw new Error("No time provided to Timer")
  }

  let countdownDate
  let queuedTime = 0
  let timerInterval

  const removeInterval = () => {
    clearInterval(timerInterval)
    timerInterval = null
  }
  const start = () => {
    if (!timerInterval) { // debounce multiple starts.
      if (queuedTime) {
        countdownDate = Date.now() + queuedTime
        queuedTime = 0
      } else {
        countdownDate = Date.now() + baseTime
      }

      let previous
      timerInterval = setInterval(() => {
        const roundedDownToSecond = Math.floor(getTime() / 1000) * 1000
        const timeRemaining = roundedDownToSecond >= 0
        if (roundedDownToSecond !== previous) {
          if (timeRemaining || continueOn) {
            previous = roundedDownToSecond
            onIncrement(roundedDownToSecond)
          } else {
            pause()
          }
        }
      }, 300)
    }
  }
  const getTime = () => {
    if (queuedTime) {
      return queuedTime
    } else if (countdownDate) {
      return countdownDate - Date.now()
    }
  }
  const pause = () => {
    queuedTime = getTime()
    removeInterval()
  }
  const reset = () => {
    queuedTime = baseTime
    removeInterval()
  }

  return {
    start,
    getTime,
    pause,
    reset,
  }
}
