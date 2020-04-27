const appConfig = Object.freeze(require("./config"));
const postgres = Object.freeze(require("./postgres"));

module.exports = Object.assign(
  {},
  {
    appConfig,
    postgres
  }
);
