const { uniqueID } = require("teeny-js-utilities");
const { performance, PerformanceObserver } = require("perf_hooks");
const TeenyLogger = require("teeny-logger");
const logger = new TeenyLogger({
  boring: process.env.NODE_ENV === "test",
});
const SEC_TO_NANOSEC = 1e9;

const moduleLoadTimeNS = Number(process.hrtime.bigint());
const upTimeNS = process.uptime() * SEC_TO_NANOSEC;
const nodeLoadTimeNS = moduleLoadTimeNS - upTimeNS;

class Performance {
  constructor() {
    this.perfData = {};
    this.perfObserver = new PerformanceObserver((items) => {
      items.getEntries().forEach((entry) => {
        this.perfData.duration = entry.duration;
      });
    });
    this.perfObserver.observe({ entryTypes: ["measure"] });
  }

  start() {
    if (!this.startMarkerName) {
      this.startMarkerName = uniqueID();
      performance.mark(this.startMarkerName);
    } else {
      logger.error("Performance.start() can only be called once");
    }
  }

  stop() {
    if (!this.startMarkerName) {
      logger.error(
        "Performance.stop() can only be called once after Performance.start()"
      );
    } else {
      this.stopMarkerName = uniqueID();
      const measureName = `internal-${this.startMarkerName}-${this.stopMarkerName}`;

      performance.mark(this.stopMarkerName);
      performance.measure(
        measureName,
        this.startMarkerName,
        this.stopMarkerName
      );
      this.startMarkerName = null;
      this.stopMarkerName = null;
    }
  }

  /**
   * This static method "tries" to replicate the browser equivalent of the
   * performance.now() method that returns a DOMHighResTimeStamp,
   * measured in milliseconds.
   *
   * NOTE: in this polyfill, it's actually returning nanoseconds.
   *
   * According to the [High Resolution Time specification](http://www.w3.org/TR/hr-time/),
   * the number of milliseconds reported by performance.now should be relative
   * to the value of performance.timing.navigationStart.
   *
   * In this polyfill, it is in nanoseconds and it is relative to the time the
   * current Node process has started (inferred from process.uptime()).
   *
   */
  static now() {
    return Number(process.hrtime.bigint()) - nodeLoadTimeNS;
  }

  get results() {
    return {
      duration: this.perfData.duration || null,
    };
  }
}

module.exports = {
  Performance,
};
