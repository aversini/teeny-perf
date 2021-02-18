/* eslint-disable no-magic-numbers */
const { Performance } = require("./performance");

let last = 0,
  id = 0;

const queue = [];
const frameDuration = 1000 / 60;

/**
 *
 * Nodejs polyfill for the window.requestAnimationFrame() method.
 * It tells the nodejs that you wish to perform an something (does not have to
 * be an animation) and requests that nodejs calls a specified function
 * to update something before the next tick.
 * The method takes a callback as an argument to be invoked before the tick.
 *
 * The callback method is passed a single argument, the equivalent of
 * DOMHighResTimeStamp but in nanoseconds (see Performace.now()).
 */
const requestAnimationFrame = (callback) => {
  if (queue.length === 0) {
    const _now = Performance.now();
    const next = Math.max(0, frameDuration - (_now - last));
    last = next + _now;
    setTimeout(function () {
      const cp = queue.slice(0);
      /*
       * Clear queue here to prevent
       * callbacks from appending listeners
       * to the current frame's queue
       */
      queue.length = 0;
      for (let i = 0; i < cp.length; i++) {
        if (!cp[i].cancelled) {
          try {
            cp[i].callback(last);
          } catch (e) {
            setTimeout(function () {
              throw e;
            }, 0);
          }
        }
      }
    }, Math.round(next));
  }
  queue.push({
    callback,
    cancelled: false,
    handle: ++id,
  });
  return id;
};

const cancelAnimationFrame = function (handle) {
  for (let i = 0; i < queue.length; i++) {
    if (queue[i].handle === handle) {
      queue[i].cancelled = true;
    }
  }
};

module.exports = {
  cancelAnimationFrame,
  requestAnimationFrame,
};
