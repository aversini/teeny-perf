/* eslint-disable no-magic-numbers */
const { Benchmark } = require("../index");

describe("when testing for Benchamrk with no logging side-effects", () => {
  it("should report basic benchmark data", async () => {
    const fct1 = () => Math.sqrt(42);
    const fct2 = () => Math.sqrt(43);

    const bench = new Benchmark();
    await bench.run([fct1, fct2, () => Math.sqrt(44)], [41], 1, 2);
    const res = bench.results;
    expect(res[0].id).toBe("fct1");
    expect(res[0].totalRuns).toBe(2);
    expect(res[1].id).toBe("fct2");
    expect(res[2].id).toBe("anonymous-2");
  });

  it("should run a minimum of one iteration", async () => {
    const fct1 = () => Math.sqrt(42);
    const fct2 = () => Math.sqrt(43);

    const bench = new Benchmark();
    await bench.run([fct1, fct2, () => Math.sqrt(44)], 41);
    const res = bench.results;
    expect(res[0].id).toBe("fct1");
    expect(res[0].totalRuns).toBe(1);
    expect(res[1].id).toBe("fct2");
    expect(res[2].id).toBe("anonymous-2");
  });

  it("should run a minimum of one sample", async () => {
    const fct1 = () => Math.sqrt(42);
    const fct2 = () => Math.sqrt(43);

    const bench = new Benchmark();
    await bench.run([fct1, fct2, () => Math.sqrt(44)], null, 1);
    const res = bench.results;
    expect(res[0].id).toBe("fct1");
    expect(res[0].totalRuns).toBe(1);
    expect(res[1].id).toBe("fct2");
    expect(res[2].id).toBe("anonymous-2");
  });
});
