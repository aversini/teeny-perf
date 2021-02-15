const { uniqueID } = require("teeny-js-utilities");
const { performance, PerformanceObserver } = require("perf_hooks");
const TeenyLogger = require("teeny-logger");
const logger = new TeenyLogger({
  boring: process.env.NODE_ENV === "test",
});

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

  get results() {
    return {
      duration: this.perfData.duration || null,
    };
  }
}

module.exports = Performance;
