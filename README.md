# Pomodoro Timer
Go read the [Wikipedia article](https://en.wikipedia.org/wiki/Pomodoro_Technique) for an overview of what the technique is.
Highlights are:
* Traditionally 25 minute "Pomodoros"
* 3-5 minute short breaks
* 15-30 minute long breaks
* Take a long break every 4 Pomodoros.

Somewhat less visible in the article is the idea that *planning* of the tasks should take place before you start.
So, a the beginning of the workday (for instance) you'd sit down, write down what you want to get done, break it down into smaller chunks, and assign the chunks to Pomodoros.

There's also the idea of *rewarding* yourself when completing tasks.
The buzzer to let you know that a task is done is separate from the actual completion of it.
The task is complete when you write your check mark down.
We know from video games that we can provide feedback + dopamine to someone with sound, lights, whatever.
So, I think it would be nice to provide something a little nicer than "BUZZZZZZZZZ".

Part of that would be to separate the completion of the *timer* from the completion of the *task*.
This opens us up further to [overlearning](https://en.wikipedia.org/wiki/Overlearning) as well.

With that the workflow will look something like:
1. Define your tasks for the day -- how many Pomodoros do you want to do? (this has subtasks but whatevs)
2. Start a thing.
3. Buzz buzz! The task is done
4. Go *acknowledge* the timer, get your confetti + cookies + nice sound and a completion check mark.
5. Start your break.

The key here is what "acknowledging" will look like.

* todo: Add pattern validation to inputs for times
* todo: Add placeholder values on inputs for times
* todo: What does "acknowledging" task completion look like?
* todo: Create a record of completed Pomodoros.
* todo: Share push notifications between desktop and phone.
* todo: PWAify your stuff.
* todo: CSS to lessen the visual assault.
* todo: How can I associate a task with a pomodoro? Would that even be nice?
* todo: Figure out a good sound to associate with task completion.
* todo: It would be really cool to associate the pomodoro timer with Spotify to play some music while things are happening.
* todo: Webstorm is not playing well as a webserver and I need to see about running babel or something anyway -- Setup webpack.
* todo: Put things in a Docker container for local work because *everyone* will want to pull this down and use it locally.
* todo: Track down the documentation you've been reading and Ankify it so you don't forget everything in a week.
* todo: Find out if Do not disturb can be detected or turned on from a browser. Would be nice to use my phone to detect that I'm working when it's face down.
* todo: Unpack pomodoro icons
* todo: Figure out how to play a sound
* todo: Get .htaccess file over to the httpd.conf path in the Docker container. See the .htaccess file for more

## Ankify
* https://developers.google.com/web/ilt/pwa/introduction-to-push-notifications
* https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules
* https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import
* https://developers.google.com/web/fundamentals/push-notifications
* https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API/Using_the_Notifications_API
* https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/Promise
* https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
* https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/checkbox
* https://developer.mozilla.org/en-US/docs/Web/API/Notification/requestPermission
* https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart
* https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers
* `https://hub.docker.com/_/httpd`
* https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input

## Favorite typo
Lol: "Pomorodos" -- semantic satiation has been achieved. 🚀

## Docker configurations
To mount the source directory:
```sh
$ docker run -dit --name dev-server -p 8080:80 --mount type=bind,src="$(pwd)/src",dst="/usr/local/apache2/htdocs/" httpd:2.4-alpine
```

Build the container with docker build.
```sh
$ docker build -t pomodoro .
```
