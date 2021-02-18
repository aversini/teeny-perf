const events = require("events");
const {
  requestAnimationFrame,
  cancelAnimationFrame,
} = require("./requestAnimationFrame");
const { Performance } = require("./performance");

const EVENT_START = "hrt::start";
const EVENT_TICK = "hrt::tick";
const EVENT_COMPLETE = "hrt::complete";
const EVENT_CANCEL = "hrt::cancel";

const MILLISEC_TO_NANOSEC = 1e6;

class HighResTimer extends events.EventEmitter {
  constructor(timeout) {
    super();
    if (!timeout || typeof timeout !== "number") {
      throw new Error("timeout value is invalid: expecting milliseconds");
    }
    this._duration = timeout * MILLISEC_TO_NANOSEC;
  }

  _startPolling() {
    const poll = (pollingTimestamp) => {
      if (
        this._cancelling ||
        (this._running && pollingTimestamp >= this._targetTime)
      ) {
        this._complete();
      } else {
        this._totalTicks++;
        this.emit(EVENT_TICK, this);
        this._nextFrameId = requestAnimationFrame(poll);
      }
    };

    poll(Performance.now());
    return this;
  }

  _complete() {
    this._running = false;
    this._cancelling = false;
    cancelAnimationFrame(this._nextFrameId);
    this.emit(EVENT_COMPLETE, this);
    return this;
  }

  cancel() {
    this._cancelling = true;
    this.emit(EVENT_CANCEL, this);
    return this;
  }

  start() {
    if (this._running) {
      return this;
    }
    this._targetTime = Performance.now() + this._duration;
    this._running = true;
    this._totalTicks = 0;
    this._startPolling();
    this.emit(EVENT_START, this);
    return this;
  }
}

module.exports = {
  EVENT_CANCEL,
  EVENT_COMPLETE,
  EVENT_START,
  EVENT_TICK,
  HighResTimer,
};
