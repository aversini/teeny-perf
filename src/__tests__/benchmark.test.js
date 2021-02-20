/* eslint-disable no-magic-numbers */

const { Benchmark } = require("../index");

let mockLog,
  mockLogInfo,
  mockLogWarning,
  spyExit,
  spyLog,
  spyLogInfo,
  spyLogWarning,
  mockExit;

describe("when testing for Benchmark with no logging side-effects", () => {
  it("should report basic benchmark data", async () => {
    const bench = new Benchmark("Name of the Benchmark Suite", {
      verbose: false,
    });
    bench.add("First", () => {
      [1, 2].reduce((a, b) => a + b);
    });
    bench.add(
      "Second",
      () => {
        [1, 2, 3, 4, 5].reduce((a, b) => a + b);
      },
      { maxTime: 1, minSamples: 1 }
    );
    bench.add(
      "Third",
      () => {
        [1, 2, 3].reduce((a, b) => a + b);
      },
      { maxTime: 1, minSamples: 1 }
    );

    const res = await bench.run();

    const date = new Date(res.date).toDateString();
    expect(date).not.toEqual("Invalid Date");
    expect(res.name).toBe("Name of the Benchmark Suite");
    expect(res.results.length).toEqual(3);
    expect(res.results[0].name).toEqual("First");
    expect(res.results[1].name).toEqual("Second");
    expect(res.results[2].name).toEqual("Third");
    expect(typeof res.results[0].ops).toEqual("number");
    expect(typeof res.results[1].ops).toEqual("number");
    expect(typeof res.results[2].ops).toEqual("number");
    expect(typeof res.results[0].margin).toEqual("number");
    expect(typeof res.results[1].margin).toEqual("number");
    expect(typeof res.results[2].margin).toEqual("number");
    expect(typeof res.results[0].percentSlower).toEqual("number");
    expect(typeof res.results[1].percentSlower).toEqual("number");
    expect(typeof res.results[2].percentSlower).toEqual("number");
    expect(typeof res.fastest.name).toEqual("string");
    expect(typeof res.slowest.name).toEqual("string");
    expect(typeof res.fastest.index).toEqual("number");
    expect(typeof res.slowest.index).toEqual("number");
  });

  it("should ignore tests marked with skip for benchmark data", async () => {
    const bench = new Benchmark("Name of the Benchmark Suite", {
      verbose: false,
    });
    bench.add(
      "First",
      () => {
        [1, 2].reduce((a, b) => a + b);
      },
      { maxTime: 1, minSamples: 1 }
    );
    bench.add(
      "Second",
      () => {
        [1, 2, 3, 4, 5].reduce((a, b) => a + b);
      },
      { maxTime: 1, minSamples: 1 }
    );
    bench.skip(
      "Third",
      () => {
        [1, 2, 3].reduce((a, b) => a + b);
      },
      { maxTime: 1, minSamples: 1 }
    );

    const res = await bench.run();

    const date = new Date(res.date).toDateString();
    expect(date).not.toEqual("Invalid Date");
    expect(res.name).toBe("Name of the Benchmark Suite");
    expect(res.results.length).toEqual(2);
    expect(res.results[0].name).toEqual("First");
    expect(res.results[1].name).toEqual("Second");
    expect(typeof res.results[0].ops).toEqual("number");
    expect(typeof res.results[1].ops).toEqual("number");
    expect(typeof res.results[0].margin).toEqual("number");
    expect(typeof res.results[1].margin).toEqual("number");
    expect(typeof res.results[0].percentSlower).toEqual("number");
    expect(typeof res.results[1].percentSlower).toEqual("number");
    expect(typeof res.fastest.name).toEqual("string");
    expect(typeof res.slowest.name).toEqual("string");
    expect(typeof res.fastest.index).toEqual("number");
    expect(typeof res.slowest.index).toEqual("number");
  });

  it("should interpret Promises in tests for benchmark data", async () => {
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const bench = new Benchmark("Name of the Benchmark Suite", {
      verbose: false,
    });
    bench.add(
      "First",
      async () => {
        await delay(250);
        [(1, 2)].reduce((a, b) => a + b);
      },
      { maxTime: 1, minSamples: 1 }
    );
    bench.add("Second", () => delay(250), { maxTime: 1, minSamples: 1 });
    bench.skip(
      "Third",
      () => {
        [1, 2, 3].reduce((a, b) => a + b);
      },
      { maxTime: 1, minSamples: 1 }
    );

    const res = await bench.run();

    const date = new Date(res.date).toDateString();
    expect(date).not.toEqual("Invalid Date");
    expect(res.name).toBe("Name of the Benchmark Suite");
    expect(res.results.length).toEqual(2);
    expect(res.results[0].name).toEqual("First");
    expect(res.results[1].name).toEqual("Second");
    expect(typeof res.results[0].ops).toEqual("number");
    expect(typeof res.results[1].ops).toEqual("number");
    expect(typeof res.results[0].margin).toEqual("number");
    expect(typeof res.results[1].margin).toEqual("number");
    expect(typeof res.results[0].percentSlower).toEqual("number");
    expect(typeof res.results[1].percentSlower).toEqual("number");
    expect(typeof res.fastest.name).toEqual("string");
    expect(typeof res.slowest.name).toEqual("string");
    expect(typeof res.fastest.index).toEqual("number");
    expect(typeof res.slowest.index).toEqual("number");
  });
});

describe("when testing for Benchmark with logging side-effects", () => {
  beforeEach(() => {
    mockExit = jest.fn();
    mockLog = jest.fn();
    mockLogInfo = jest.fn();
    mockLogWarning = jest.fn();

    spyExit = jest.spyOn(process, "exit").mockImplementation(mockExit);
    spyLog = jest.spyOn(console, "log").mockImplementation(mockLog);
    spyLogInfo = jest.spyOn(console, "info").mockImplementation(mockLogInfo);
    spyLogWarning = jest
      .spyOn(console, "warn")
      .mockImplementation(mockLogWarning);
  });
  afterEach(() => {
    spyExit.mockRestore();
    spyLog.mockRestore();
    spyLogInfo.mockRestore();
    spyLogWarning.mockRestore();
  });

  it("should report basic benchmark data", async () => {
    const bench = new Benchmark("Name of the Benchmark Suite");
    bench.add(
      "First",
      () => {
        [1, 2].reduce((a, b) => a + b);
      },
      { maxTime: 1, minSamples: 1 }
    );
    bench.add(
      "Second",
      () => {
        [1, 2, 3, 4, 5].reduce((a, b) => a + b);
      },
      { maxTime: 1, minSamples: 1 }
    );
    bench.add(
      "Third",
      () => {
        [1, 2, 3].reduce((a, b) => a + b);
      },
      { maxTime: 1, minSamples: 1 }
    );
    bench.add("Fourth", () => {
      // Some setup:
      const re = /o/;
      // Benchmarked code wrapped in a function:
      return () => re.test("Hello World!");
    });

    await bench.run();

    expect(mockLogInfo).toHaveBeenCalledWith(
      expect.stringContaining(
        'Running "Name of the Benchmark Suite" benchmark suite...'
      )
    );
    expect(mockLogInfo).toHaveBeenCalledWith(
      expect.stringContaining('Test "First" complete')
    );
  });
});
