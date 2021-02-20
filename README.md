# teeny-perf

![npm](https://img.shields.io/npm/v/teeny-perf?label=version&logo=npm)
![David](https://img.shields.io/david/aversini/teeny-perf?logo=npm)
![David](https://img.shields.io/david/dev/aversini/teeny-perf?logo=npm)
![GitHub Workflow Status](https://img.shields.io/github/workflow/status/aversini/teeny-perf/coverage?label=coverage&logo=github)

> Performance and benchmarking utilities for Node

## Table of Content

- [Installation](#installation)
- [API](#api)
  - [Benchmark](#benchmark)
  - [HighResTimer](#highrestimer)
  - [Performance](#performance)
- [License](#license)

## Installation

```sh
> cd your-project
> npm install teeny-perf
```

## API

### Benchmark

Benchmark is a class that provides a simple benchmarking tool for node, relying on the original [benchmark module](https://www.npmjs.com/package/benchmark) that use to power the now-defunct [jsPerf](https://jsperf.com/) website, and heavily inspired by the great [benny](https://www.npmjs.com/package/benny).

#### Constructor

The constructor requires a string: the name for the benchmark suite.
It also takes an optional second argument: an object defining if the test should be verbose (default) or not.

To make a test silent, instantiate a benchmark suite as follows:

```js
const { Benchmark } = require("teeny-js-utilities");
const bench = new Benchmark("My test suite", { verbose: false });
```

#### Methods

**add(name, function)**

Adds a test to the suite.

| Argument | Type     | Default | Description          |
| -------- | -------- | ------- | -------------------- |
| name     | string   |         | the name of the test |
| function | Function |         | The function to run  |

**async run() => {results}**

Runs the Benchmark suite.

#### Examples

```js
const { Benchmark } = require("teeny-js-utilities");
const bench = new Benchmark("My test suite");

bench.add("Regex", () => {
  /o/.test("Hello World!");
});
bench.add("IndexOf", () => {
  "Hello World!".indexOf("o") > -1;
});
// if setup is required, the test should be wrapped
bench.add("Cached Regex", () => {
  // Some setup:
  const re = /o/;
  // Benchmarked code wrapped in a function:
  return () => re.test("Hello World!");
});

const results = bench.run();

/**
 * Because the test suite is verbose by default, it would
 * print something like:
 *
 * ┌──────────────┬─────────────┬────────────────┬─────────────────┬─────────┐
 * │ Name         │     Ops/sec │ Percent slower │ Margin of error │    Rank │
 * ├──────────────┼─────────────┼────────────────┼─────────────────┼─────────┤
 * │ Regex        │  49,106,105 │         94.65% │          ±1.16% │ Slowest │
 * ├──────────────┼─────────────┼────────────────┼─────────────────┼─────────┤
 * │ IndexOf      │ 917,842,104 │             0% │          ±1.26% │ Fastest │
 * ├──────────────┼─────────────┼────────────────┼─────────────────┼─────────┤
 * │ Cached Regex │  56,337,056 │         93.86% │          ±1.16% │         │
 * └──────────────┴─────────────┴────────────────┴─────────────────┴─────────┘
 *
 */
```

### HighResTimer

HighResTimer is a class that provides a high-resolution timer based on `process.hrtime.bigint()` and a nodejs polyfill for `window.requestAnimationFrame()`.

#### Constructor

The constructor requires a number: the time in milliseconds for the timer to run.

#### Methods

| Method | Description                             |
| ------ | --------------------------------------- |
| start  | Start the timer                         |
| cancel | Cancel the timer before its time is due |

#### Events

| Name           | Description                              |
| -------------- | ---------------------------------------- |
| EVENT_CANCEL   | Event sent when the timer is cancelled   |
| EVENT_COMPLETE | Event sent when the timer has terminated |
| EVENT_START    | Event sent when the timer starts         |
| EVENT_TICK     | Event sent at each process.tick          |

#### Examples

```js
const {
  HighResTimer,
  EVENT_START,
  EVENT_TICK,
  EVENT_COMPLETE,
} = require("teeny-perf");

const timer = new HighResTimer(250);
timer
  .on(EVENT_START, () => {
    console.log("-> Timer has started");
  })
  .on(EVENT_TICK, () => {
    console.log("-> tick...");
  })
  .on(EVENT_COMPLETE, () => {
    console.log("-> Timer is done!");
  })
  .start();
```

### Performance

Performance is a wrapper around [nodejs Performance measurement APIs](https://nodejs.org/api/perf_hooks.html).

It provides a highly simplified class for an extremely simple case:

- start performance monitoring
- do something that takes a while
- stop performance monitoring
- read how much time passed between start and stop (in milliseconds)
- rinse and repeat

#### Methods

| Method | Description                                      |
| ------ | ------------------------------------------------ |
| start  | Starts measuring performance                     |
| stop   | Stops measuring performance and store the result |

| Getter           | Type   | Description          |
| ---------------- | ------ | -------------------- |
| results          | Object |                      |
| results.duration | Number | Time in milliseconds |

#### Examples

##### Basic performance gathering

```js
const { Performance } = require("teeny-js-utilities");
const perf = new Performance();

// somewhere in your code, you want to start measuring performance:
perf.start();
// do long lasting actions
(...)
// when done, tell performance to stop:
perf.stop();
// the duration can now be found in the Performance class getter `results`:
console.log(`It took ${perf.results.duration} milliseconds to run...`);
```

##### Multiple performance gatherings

```js
const { Performance } = require("teeny-js-utilities");
const perf = new Performance();

// somewhere in your code, you want to start measuring performance:
perf.start();
// do long lasting actions
(...)
// when done, tell performance to stop:
perf.stop();
// Save the results
const res1 = perf.results.duration;

// further down in your code, start measuring another performance:
perf.start();
// do other long lasting actions
(...)
// when done, tell performance to stop:
perf.stop();
// Save the results
const res2 = perf.results.duration;

// -> res1 and res2 will have 2 different duration results.

```

## License

MIT © Arno Versini
