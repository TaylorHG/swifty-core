import winston from "winston";

class Logger {
  constructor(config) {
    this.logger = new winston.Logger({
      transports: [
        new (winston.transports.Console)({ level: 'silly' }),
        new (winston.transports.File)({ filename: 'application.log', level: 'silly' })
      ]
    });
    this.initialized = true;
  }

  // Log level: 0
  error() {
    if (this.initialized !== true) {
      throw new Error("Attempted to log something before the LOGGER had a chance to be initialized.");
    }
    this.logger.error.apply(this, arguments);
  }

  // Log level: 1
  warn() {
    if (this.initialized !== true) {
      throw new Error("Attempted to log something before the LOGGER had a chance to be initialized.");
    }
    this.logger.warn.apply(this, arguments);
  }

  // Log level: 2
  info() {
    if (this.initialized !== true) {
      throw new Error("Attempted to log something before the LOGGER had a chance to be initialized.");
    }
    this.logger.info.apply(this, arguments);
  }

  // Log level: 3
  verbose() {
    if (this.initialized !== true) {
      throw new Error("Attempted to log something before the LOGGER had a chance to be initialized.");
    }
    this.logger.verbose.apply(this, arguments);
  }

  // Log level: 4
  debug() {
    if (this.initialized !== true) {
      throw new Error("Attempted to log something before the LOGGER had a chance to be initialized.");
    }
    this.logger.debug.apply(this, arguments);
  }

  // Log level: 5
  silly() {
    if (this.initialized !== true) {
      throw new Error("Attempted to log something before the LOGGER had a chance to be initialized.");
    }
    this.logger.silly.apply(this, arguments);
  }
}


// Export a reference to the logger as LOGGER
export let LOGGER = "Logger has not been initialized yet!";
export let initializeLogger = function(config) {
  LOGGER = new Logger(config);
}
