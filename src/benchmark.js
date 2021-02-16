const Performance = require("./performance");

class Benchmark {
  constructor() {
    this.averages = [];
    this.perf = new Performance();
  }

  async runSampling(fct, index, args) {
    const samples = [];

    for (
      let indexAverage = 0;
      indexAverage < this.totalSamples;
      indexAverage++
    ) {
      this.perf.start();
      for (let index = 0; index < this.iterations; index++) {
        if (typeof args === "string" || typeof args === "number") {
          args = [args];
        } else {
          args = args && args.length ? args : [];
        }
        await fct(...args);
      }
      this.perf.stop();
      samples.push(this.perf.results.duration);
    }
    this.averages.push({
      duration: samples.reduce((a, b) => a + b) / samples.length,
      id: fct.name || `anonymous-${index}`,
      totalRuns: this.iterations * this.totalSamples,
    });
  }

  async run(functions, args, iterations, totalSamples) {
    this.iterations = iterations || 1;
    this.totalSamples = totalSamples || 1;

    for (const fct in functions) {
      /* istanbul ignore else */
      if ({}.hasOwnProperty.call(functions, fct)) {
        await this.runSampling(functions[fct], fct, args);
      }
    }
  }

  get results() {
    return this.averages;
  }
}

module.exports = Benchmark;
