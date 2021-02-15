# teeny-perf

![npm](https://img.shields.io/npm/v/teeny-perf?label=version&logo=npm)
![David](https://img.shields.io/david/aversini/teeny-perf?logo=npm)
![David](https://img.shields.io/david/dev/aversini/teeny-perf?logo=npm)
![GitHub Workflow Status](https://img.shields.io/github/workflow/status/aversini/teeny-perf/coverage?label=coverage&logo=github)

> Performance and benchmarking utilities for Node

## Table of Content

- [Installation](#installation)
- [API](#api)
  - [Performance](#performance)
- [License](#license)

## Installation

```sh
> cd your-project
> npm install teeny-perf
```

## API

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
