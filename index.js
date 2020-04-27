const app = require("./app");

const SERVICE_NAME = "NeOHoS";
const LOG_DIR = "../../logDir";
const { EventEmitter } = require("events");
const connections = require("./connections/index.js");

const common = require("logger-common")(SERVICE_NAME, LOG_DIR);

const mediator = new EventEmitter();
// console.log(process.env.PORT);
const obj = {
  // should be configured in env folder
  port: process.env.PORT || "4001",
  logger: common.logger,
  middlewares: common.middlewares
};

mediator.on("start-boot", connObj => {
  app
    .start(
      obj,
      connObj.postgres
    )
    // eslint-disable-next-line no-unused-vars
    .then(server => {
      common.logger.appLogger.info(`${SERVICE_NAME}:${obj.port} started`);
    })
    .catch(err => {
      common.logger.appLogger.error(
        `Could not start server because of the error ${err}`,
        // eslint-disable-next-line no-process-exit
        process.exit(1)
      );
    });
});
// connect to db and then emit start boot event
Promise.all([
  connections.postgres.connectToDb()
])
  .then(connectionObject => {
    mediator.emit("start-boot", {
      postgres: connectionObject[0]
    });
  })
  .catch(err => {
    common.logger.appLogger.error(`Boot Db connection Error ${err}`);
  });
