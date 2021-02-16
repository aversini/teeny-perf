/* eslint-disable no-magic-numbers */
const { Performance } = require("../index");

let mockLog,
  mockLogError,
  mockLogWarning,
  spyExit,
  spyLog,
  spyLogError,
  spyLogWarning,
  mockExit;

describe("when testing for Performance with no logging side-effects", () => {
  it("should report basic performance data", async () => {
    const perf = new Performance();
    perf.start();
    await new Promise((resolve) =>
      setTimeout(async () => {
        resolve();
        perf.stop();
        expect(perf.results.duration).toBeGreaterThanOrEqual(500);
        perf.start();
        await new Promise((resolve) =>
          setTimeout(() => {
            resolve();
            perf.stop();
            expect(perf.results.duration).toBeGreaterThanOrEqual(1000);
          }, 1000)
        );
      }, 500)
    );
  });
});

/**
 * Some utilities have logging capabilities that needs to be
 * tested a little bit differently:
 * - mocking process.exit
 * - console.log
 * - inquirer.prompt
 */
describe("when testing for utilities with logging side-effects", () => {
  beforeEach(() => {
    mockExit = jest.fn();
    mockLog = jest.fn();
    mockLogError = jest.fn();
    mockLogWarning = jest.fn();

    spyExit = jest.spyOn(process, "exit").mockImplementation(mockExit);
    spyLog = jest.spyOn(console, "log").mockImplementation(mockLog);
    spyLogError = jest.spyOn(console, "error").mockImplementation(mockLogError);
    spyLogWarning = jest
      .spyOn(console, "warn")
      .mockImplementation(mockLogWarning);
  });
  afterEach(() => {
    spyExit.mockRestore();
    spyLog.mockRestore();
    spyLogError.mockRestore();
    spyLogWarning.mockRestore();
  });
  it("should not report performance data and log and error if start() is called twice", async () => {
    const perf = new Performance();
    perf.start();
    perf.start();
    expect(mockLogError).toHaveBeenCalledWith(
      "Performance.start() can only be called once"
    );
    expect(perf.results).toStrictEqual({ duration: null });
  });

  it("should not report performance data and log and error if stop() is called without start()", async () => {
    const perf = new Performance();
    perf.stop();
    expect(mockLogError).toHaveBeenCalledWith(
      "Performance.stop() can only be called once after Performance.start()"
    );
    expect(perf.results).toStrictEqual({ duration: null });
  });
});
