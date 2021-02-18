/* eslint-disable no-magic-numbers */
const {
  HighResTimer,
  EVENT_START,
  EVENT_TICK,
  EVENT_COMPLETE,
} = require("../timer");

describe("when testing for HighResTimer with no logging side-effects", () => {
  it("should report event data", async () => {
    const timeout = new HighResTimer(200);
    await new Promise((resolve) => {
      timeout
        .on(EVENT_START, (e) => {
          expect(e._nextFrameId).toBe(1);
          expect(e._running).toBe(true);
        })
        .on(EVENT_TICK, (e) => {
          expect(e).toBeInstanceOf(HighResTimer);
          expect(e._running).toBe(true);
        })
        .on(EVENT_COMPLETE, (e) => {
          expect(e._running).toBe(false);
          expect(e._totalTicks).toBeGreaterThan(100);
          resolve();
        })
        .start();
    });
  });

  it("should not start a new timer data", async () => {
    const timeout = new HighResTimer(200);
    await new Promise((resolve) => {
      timeout
        .on(EVENT_START, (e) => {
          expect(e._nextFrameId).toBeGreaterThan(1);
          expect(e._running).toBe(true);
        })
        .on(EVENT_TICK, (e) => {
          expect(e).toBeInstanceOf(HighResTimer);
          expect(e._running).toBe(true);
        })
        .on(EVENT_COMPLETE, (e) => {
          expect(e._running).toBe(false);
          expect(e._totalTicks).toBeGreaterThan(100);
          resolve();
        });
      timeout.start();
      timeout.start();
    });
  });

  it("should be able to cancel a timer", async () => {
    const timeout = new HighResTimer(2000);
    await new Promise((resolve) => {
      timeout
        .on(EVENT_START, (e) => {
          expect(e._nextFrameId).toBeGreaterThan(1);
          expect(e._running).toBe(true);
        })
        .on(EVENT_TICK, (e) => {
          expect(e).toBeInstanceOf(HighResTimer);
          expect(e._running).toBe(true);
          e.cancel();
        })
        .on(EVENT_COMPLETE, (e) => {
          expect(e._totalTicks).toBe(1);
          expect(e._running).toBe(false);
          resolve();
        });
      timeout.start();
    });
  });

  it("should throw if timeout is not passed", async () => {
    expect(() => {
      // eslint-disable-next-line no-new
      new HighResTimer();
    }).toThrow();
  });
});
