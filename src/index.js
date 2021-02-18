const PrettyError = require("pretty-error");
const pe = new PrettyError();
pe.start();

const Benchmark = require("./benchmark");
const { Performance } = require("./performance");
const { HighResTimer } = require("./timer");

module.exports = {
  Benchmark,
  HighResTimer,
  Performance,
};
