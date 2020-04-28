/* eslint-disable lines-around-comment */
/* eslint-disable no-sync */
const express = require("express");
const helmet = require("helmet");
const noCache = require('nocache')
const morgan = require("morgan");
const routes = require("./routes");
const cors = require("cors");
const BodyParser = require("body-parser");
const { isCelebrate } = require("celebrate");
const http = require("http");


const start = (
  options,
  postgres
) =>
  // eslint-disable-next-line consistent-return
  new Promise((resolve, reject) => {
    if (!postgres) {
      return reject(
        new Error("The Server must be started with a connected db")
      );
    }

    // init the express app and logger
    const app = express();
    const httpServer = http.Server(app);
    options.logger.appLogger.info("Attaching Helmet for Security");
    app.use(helmet());
    app.use(noCache());
    app.use(cors());
    app.use(BodyParser.json({ limit: "50mb" }));
    app.use(options.middlewares.setCorrelationId());
    options.logger.appLogger.info("setCorelationId Middleware");


    // attach morgan for http logger after setting the corelation id only
    app.use(
      morgan(options.logger.morganLogger.format, {
        stream: options.logger.morganLogger.stream
      })
    );
    // parse the json body
    app.use(express.json());

    app.get(`/`, (req, res) => {
      res.status(200).json({
        message: "Welcome to avouch, release 0.0.1"
      });
    });

    // route for ping for status monitoring services
    app.get(`/ping`, (req, res) => {
      res.status(200).json({ message: `Hello World from the data team` });
    });

    app.get(`/test`, (req, res) => {
      res.status(200).json({ message: `sent something` });
    });
    app.get(`/validate`, (req, res) => {
      res.status(200).json({ ...req.headers });
    });

    app.get(`/ip`, (req, res) => {
      let ip =
        req.headers.HTTP_X_FORWARDED_FOR ||
        req.headers["x-forwarded-for"] ||
        req.connection.remoteAddress;
      ip = ip.trim();
      if (ip.toLowerCase().startsWith("::ffff:")) {
        ip = ip.substring("::ffff:".length);
      }
      if (ip.toLowerCase().includes(":")) {
        [ip] = ip.split(":");
      }
      res.status(200).json({ ip });
    });

    // attaching db object to the req headers.
    app.use((req, res, next) => {
        req.logger = options.logger;
        req.headers.postgres = postgres;
        next();
      }
    );
    app.use(routes);
    
    // app.use(errors());

    // catch 404 and forward to error handler
    app.use((req, res, next) => {
      const err = new Error("Resource Not Found");
      err.status = 404;
      next(err);
    });

    // final all error handler
    app.use((err, req, res, next) => {
      options.logger.httpLogger.error(req, {
        message: err.message,
        error: err
      });
      if (isCelebrate(err)) {
        if (err.joi && err.joi.details) {
          const error = err.joi.details.map(er => er.message.replace(/"/g, ""));
          return res
            .status(422)
            .json({ error: error[0], correlationId: req.x_correlation_id });
        } else {
          return  res.status(422).json({ ...err, correlationId: req.x_correlation_id });
        }
      } else {
        const statusCode = err.status || 500;
        const message = {};
        message.message = err.message;
        message.error = "Internal Server Error";
        return res
          .status(statusCode)
          .json({ ...message, correlationId: req.x_correlation_id });
      }
    });

    const server = httpServer.listen(options.port, () => resolve(server));
  });

module.exports = Object.assign({}, { start });
