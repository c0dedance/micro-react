let taskid = 0
function workloop(deadline) {

  let shouldYield = false
  console.log('taskid: ', taskid);

  while (!shouldYield) {
    // run task
    taskid++
    // update time
    shouldYield = deadline.timeRemaining() < 1
  }
  requestIdleCallback(workloop)
  // console.log(IdleDeadline.timeRemaining())
}

requestIdleCallback(workloop)