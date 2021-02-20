const { Suite } = require("benchmark");
const { pipe } = require("@arrows/composition");
const { getType, types } = require("@arrows/dispatch");
const median = require("stats-median");
const TeenyLogger = require("teeny-logger");
const Table = require("cli-table3");
const { green, yellow, red } = require("kleur");

const logger = new TeenyLogger();
const MAX_DECIMAL_DIGITS = 2;

const getCaseResult = (event) => {
  const target = event.target || event;
  return {
    completed: target.stats.sample.length > 0,
    details: {
      marginOfError: target.stats.moe,
      max: Math.max(...target.stats.sample),
      mean: target.stats.mean,
      median: median.calc(target.stats.sample),
      min: Math.min(...target.stats.sample),
      relativeMarginOfError: target.stats.rme,
      sampleResults: target.stats.sample,
      sampleVariance: target.stats.variance,
      standardDeviation: target.stats.deviation,
      standardErrorOfMean: target.stats.sem,
    },
    margin: target.stats.rme,
    name: target.name,
    ops: target.hz,
    options: {
      delay: target.delay,
      initCount: target.initCount,
      maxTime: target.maxTime,
      minSamples: target.minSamples,
      minTime: target.minTime,
    },
    promise: target.defer,
    samples: target.stats.sample.length,
  };
};

const getSummary = (event, verbose) => {
  const results = Object.entries(event.currentTarget)
    .filter(([key]) => !Number.isNaN(Number(key)))
    .map(([, target]) => getCaseResult(target));

  const fastestIndex = results.reduce(
    (prev, next, index) =>
      next.ops > prev.ops ? { index, ops: next.ops } : prev,
    { index: 0, ops: 0 }
  ).index;

  const slowestIndex = results.reduce(
    (prev, next, index) =>
      next.ops < prev.ops ? { index, ops: next.ops } : prev,
    { index: 0, ops: Infinity }
  ).index;

  const resultsWithDiffs = results.map((result, index) => {
    const percentSlower =
      index === fastestIndex
        ? 0
        : Number(
            // eslint-disable-next-line no-magic-numbers
            ((1 - result.ops / results[fastestIndex].ops) * 100).toFixed(
              MAX_DECIMAL_DIGITS
            )
          );
    return { ...result, percentSlower };
  });

  if (verbose) {
    const statsTable = new Table();
    const numberFormatter = new Intl.NumberFormat();
    statsTable.push([
      "Name",
      { content: "Ops/sec", hAlign: "right" },
      { content: "Percent slower", hAlign: "right" },
      { content: "Margin of error", hAlign: "right" },
      { content: "Rank", hAlign: "right" },
    ]);
    resultsWithDiffs.forEach((result, idx) => {
      let color, rank;

      switch (idx) {
        case fastestIndex:
          color = green;
          rank = "Fastest";
          break;

        case slowestIndex:
          color = red;
          rank = "Slowest";
          break;

        default:
          color = yellow;
          rank = "";
          break;
      }

      statsTable.push([
        color(result.name),
        {
          content: color(numberFormatter.format(Math.floor(result.ops))),
          hAlign: "right",
        },
        { content: color(`${result.percentSlower}%`), hAlign: "right" },
        {
          content: color(`±${result.margin.toFixed(MAX_DECIMAL_DIGITS)}%`),
          hAlign: "right",
        },
        { content: color(`${rank}`), hAlign: "right" },
      ]);
    });
    logger.info("\nResults:");
    logger.log(statsTable.toString());
  }

  return {
    date: new Date(event.timeStamp),
    fastest: {
      index: fastestIndex,
      name: results[fastestIndex].name,
    },
    name: event.currentTarget.name,
    results: resultsWithDiffs,
    slowest: {
      index: slowestIndex,
      name: results[slowestIndex].name,
    },
  };
};

const prepareCaseFn = async (test) => {
  const returnType = getType(test());
  if (returnType === types.Function && getType(test()()) === types.Promise) {
    return {
      defer: true,
      rawTest: (deferred) => test()().then(() => deferred.resolve()),
    };
  }
  if (returnType === types.Function) {
    return {
      defer: false,
      rawTest: test(),
    };
  }
  if (returnType === types.Promise) {
    const promiseContent = await test();
    if (getType(promiseContent) === types.Function) {
      const nestedReturnType = promiseContent();
      if (getType(nestedReturnType) === types.Promise) {
        return {
          defer: true,
          rawTest: (deferred) =>
            promiseContent().then(() => deferred.resolve()),
        };
      } else {
        return {
          defer: false,
          rawTest: promiseContent,
        };
      }
    }
    return {
      defer: true,
      rawTest: (deferred) => test().then(() => deferred.resolve()),
    };
  }
  return {
    defer: false,
    rawTest: test,
  };
};

const addingTestCase = async (caseName, test, options) => {
  const { rawTest, defer } = await prepareCaseFn(test);
  const fn = (suiteObj) => {
    suiteObj.add(caseName, rawTest, { ...options, defer });
    return suiteObj;
  };
  Object.defineProperty(fn, "name", { value: "add" });
  return fn;
};

class Benchmark {
  constructor(name, { verbose = true } = {}) {
    this.name = name;
    this.verbose = verbose;
    this.fns = [];
  }

  add(caseName, test, options = {}) {
    const fn = addingTestCase(caseName, test, options);
    this.fns.push(fn);
  }

  skip() {}

  async run() {
    const unpackedFns = await Promise.all(this.fns);
    const suiteObj = new Suite(this.name);

    if (this.verbose) {
      suiteObj
        .on("start", () => {
          logger.info(`\nRunning "${this.name}" benchmark suite...`);
        })
        .on("cycle", (e) => {
          logger.info(`  ∙ Test "${e.target.name}" complete`);
        });
    }

    return new Promise((resolve, reject) => {
      pipe(...unpackedFns)(suiteObj)
        .on("complete", (event) => resolve(getSummary(event, this.verbose)))
        .on("error", reject)
        .run();
    });
  }
}

module.exports = { Benchmark };
