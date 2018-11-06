const _ = require('lodash');
const domain = require('domain');
const os = require('os');
const prettyjson = require('prettyjson');
const stringify = require('json-stringify-safe');

const isEnabled = require('./is-enabled');

/**
 * Default options for prettyjson
 */
const PrettyJsonDefaultOptions = Object.freeze({
  defaultIndentation: 4,
  inlineArrays: 1,
});

/**
 * Default options for logger levels
 */
const loggerLevels = Object.freeze({
  debug: 'debug',
  error: 'error',
  log: 'log',
  warn: 'warn',
});

/**
 * For development mode
 */
const prettyPrint = (event) => {
  const header = `[${event.timestamp}]: [${event.message}]`;
  const eventDetails = _.omit(event, 'timestamp', 'message');
  const body = prettyjson
    .render(eventDetails, _.clone(PrettyJsonDefaultOptions))
    .replace(/\n/g, '\n\t');

  return `\n${header}\n\t${body}\n\n`;
};

/**
 * Logger class implementing the recommended log structure
 * @example
 * const logger = new Logger({ correlationId, sessionId });
 */
class Logger {
  /**
   * Initialize a Logger instance, using prettyjson when LOGS_PRETTY_PRINT is set
   * @param {Object} context - custom attributes to be logged
   * @param {string} namespace - the logger namespace
   * @param {string} logPatterns - Patterns of namespaces to be logged
   */
  constructor(context, namespace = '', logPatterns = process.env.LOG_NAMESPACES) {
    /** @private */
    this.contextData = {
      context,
      name: process.env.APP_NAME,
    };

    /** @private */
    this.namespace = namespace;

    /** @private */
    this.logPatterns = logPatterns || '';

    /** @private */
    this.format = process.env.LOGS_PRETTY_PRINT ? prettyPrint : stringify;

    /** Alias for info */
    this.log = this.info;
  }

  /**
   * Returns a new logger with the same contextual information and a child namespace
   * @param {string} namespace - the namespace to be appended to the current one in the new instance
   */
  createChildLogger(namespace) {
    const prefix = this.namespace ? `${this.namespace}:` : '';

    return new Logger(this.contextData, `${prefix}${namespace}`, this.logPatterns);
  }

  /**
   * Logs a message using stdout
   * @param {Object} message - the message to be logged
   * @param {Object} [additionalArguments] - object with additional info to be logged
   */
  info(message, additionalArguments = {}) {
    this.output(message, additionalArguments);
  }

  /**
   * Logs level warn a message using stdout
   * @param {Object} message - the message to be logged
   * @param {Object} [additionalArguments] - object with additional info to be logged
   */
  warn(message, additionalArguments = {}) {
    this.output(message, additionalArguments, loggerLevels.warn);
  }

  /**
   * Logs level error a message using stdout
   * @param {Object} message - the message to be logged
   * @param {Object} [additionalArguments] - object with additional info to be logged
   */
  error(message, additionalArguments = {}) {
    this.output(message, additionalArguments, loggerLevels.error);
  }

  /**
   * Logs a message using stdout only if the debug mode is enabled
   * @param {Object} message - the message to be logged
   * @param {Object} [additionalArguments] - object with additional info to be logged
   */
  debug(message, additionalArguments = {}) {
    this.output(message, additionalArguments, loggerLevels.debug);
  }

  /**
   * Set sessionId on context in contextData
   * @param {uuid} sessionId
   */
  setSessionId(sessionId) {
    this.contextData.context = Object.assign(
      {}, this.contextData.context, { sessionId },
    );
  }

  /**
   * @private
   */
  logEvent(message, additionalArguments, level) {
    return {
      ...additionalArguments,
      ...this.contextData,
      level,
      message,
      namespace: this.namespace,
      timestamp: new Date().toISOString(),
      uptime: os.uptime(),
    };
  }

  /**
   *  @private
   */
  output(message, additionalArguments, level = loggerLevels.log) {
    if (!this.isEnabled()) {
      return;
    }

    const event = this.logEvent(message, additionalArguments, level);

    console.log(`${this.format(event)}`); // eslint-disable-line no-console
  }

  /** @private */
  isEnabled() {
    return !Logger.supressOutput && isEnabled(this.namespace, this.logPatterns);
  }

  /**
   * Returns the current Logger instance in the active domain
   * or an instance without contextual information if there is no active domain.
   */
  static current() {
    if (!domain.active) {
      return Logger.nonContextualLogger;
    }

    return domain.active.logger;
  }
}

/** @private */
Logger.nonContextualLogger = new Logger({});

/**
 * Suppress the logger output if set to true,
 * the main use case of this property is hiding logs during integration tests.
 */
Logger.supressOutput = false;

module.exports = Logger;
