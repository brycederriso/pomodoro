
const TimerTable = function ({tick, ring}) {
  if (window.Worker) {
    const timerWorker = new Worker('js/timingBooth.js')
    // Activate the Pomodoro Timer by default

    const set = ({name, baseTime, tick, ring}) => {
      timerWorker.postMessage(['SET', name, baseTime])
    }
    const pickUp = (name) => {
      timerWorker.postMessage(['ACTIVATE', name])
    }
    const start = () => {
      timerWorker.postMessage(['START'])
    }
    const pause = () => {
      timerWorker.postMessage(['PAUSE'])
    }
    const reset = () => {
      timerWorker.postMessage(['RESET'])
    }

    timerWorker.onmessage = (event) => {
      switch (event.data.type) {
        case 'TIME':
          tick(event.data)
          break;
        case 'TIMES_UP':
          ring(event.data)
          break;
        default:
          // todo: handle error case
      }
    }

    return {
      set,
      pickUp,
      start,
      pause,
      reset
    }
  } else {
    // todo: It's not clear if webworkers are required -- maybe it'll help save power when the tab isn't active?
    // todo: From above, go look at web worker lifecycle hooks and what those do
    // A friendly fallback strategy would be nice.
    document.getElementById('timer-layout').innerHTML = 'Web Workers are required.'
  }
}
