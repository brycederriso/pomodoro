function askNotificationPermission () {
  // function to actually ask the permissions
  function handlePermission (permission) {
    // Whatever the user answers, we make sure Chrome stores the information
    if (!('permission' in Notification)) {
      Notification.permission = permission
    }
  }

  function checkNotificationPromise () {
    try {
      Notification.requestPermission().then()
    } catch (e) {
      return false
    }
    return true
  }

  if (!('Notification' in window)) {
    console.log("This browser does not support notifications.")
  } else if (checkNotificationPromise()) {
    return Notification.requestPermission().then(handlePermission)
  } else {
    return new Promise((resolve) => {
      Notification.requestPermission(permission => {
        handlePermission(permission);
        resolve(permission);
      })
    })
  }
}
function sendNotification (text) {
  if (!("Notification" in window)) {
    console.log('This browser does not support notifications.')
  } else if (Notification.permission === "granted") {
    const notification = new Notification(text)
  } else if (Notification.permission !== "denied") {
    askNotificationPermission().then((permission) => {
      if (permission === 'granted') {
        const notification = new Notification(text)
      }
    });
  }
}

export {
  askNotificationPermission,
  sendNotification
}
