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
  - [Performance](#performance)
- [License](#license)

## Installation

```sh
> cd your-project
> npm install teeny-perf
```

## API

### Benchmark

Benchmark is a class that provides a simple benchmarking tool for node, relying on the [nodejs Performance measurement APIs](https://nodejs.org/api/perf_hooks.html).

#### Method

**async run(functions, arguments, iterations, totalSamples)**

| Argument     | Description        | Default | Description                            |
| ------------ | ------------------ | ------- | -------------------------------------- |
| functions    | Array of functions |         | All the functions to test              |
| arguments    | Array of functions |         | The arguments to pass to each function |
| iterations   | number             | 1       | Total time each function should run    |
| totalSamples | number             | 1       | Total time each run should be averaged |

#### Getter

| Getter              | Type            | Description                                      |
| ------------------- | --------------- | ------------------------------------------------ |
| results             | Array of Object |                                                  |
| results[].duration  | Number          | Time in milliseconds                             |
| results[].id        | String          | Unique identifier (usually name of the function) |
| results[].totalRuns | Number          | How many time the function ran                   |

#### Examples

```js
const { Benchmark } = require("teeny-js-utilities");
const bench = new Benchmark();

const fct1 = (a, b, c) => {
  /* very long running function */
};
const fct2 = (a, b, c) => {
  /* very long running function */
};

await bench.run([fct1, fct2], [111, false, "333"], 1000, 10);
// -> benchmark is running...
// the results can be found in the Benchmark class getter `results`:

bench.results.forEach((result) => {
  console.log(`Function ${result.id} average: ${result.duration}ms`);
});
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
