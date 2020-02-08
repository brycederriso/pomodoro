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
  let distance = getTime();
  if (distance < 0) {
    removeInterval()
  }
  postMessage(distance);
}

const handleStartMessage = (baseTime) => {
  if (!timerInterval) {
    startTimer(baseTime);
    timerInterval = setInterval(sendUpdate, 300);
  }
}
const handlePauseMessage = () => {
  pauseTimer();
  removeInterval();
  postMessage(getTime());
}
const handleResetMessage = (baseTime) => {
  // todo: should reset kill your current timer session?
  resetTimer(baseTime);
  removeInterval();
  postMessage(getTime());
}

// todo: build some better understood messages?
const START = "START";
const PAUSE = "PAUSE";
const RESET = "RESET";

onmessage = (event) => {
  // todo: it looks like postMessage takes any JS object. So probably shouldn't use an array.
  switch (event.data[0]) {
    case START:
      handleStartMessage(event.data[1]);
      break;
    case PAUSE:
      handlePauseMessage();
      break;
    case RESET:
      handleResetMessage(event.data[1]);
      break;
    default:
      //todo: handle error case
  }
}

