const _ = require('lodash');
const domain = require('domain');
const prettyjson = require('prettyjson');
const stringify = require('json-stringify-safe');

const isEnabled = require('./is-enabled');
const Serializer = require('./serializer');
const loggerLevels = require('./levels');
const logLevelFilter = require('./log-level-filter');

/**
 * Default options for prettyjson
 */
const PrettyJsonDefaultOptions = Object.freeze({
  defaultIndentation: 4,
  inlineArrays: 1,
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
   * @param {number} logLimit - Patterns of namespaces to be logged
   */
  constructor(context, namespace = '', logPatterns = process.env.LOG_NAMESPACES, logLimit = process.env.LOG_LIMIT, logLevel = loggerLevels.debug) {
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
    this.logLimit = logLimit || 7000;

    /** @private */
    this.logLevel = logLevel;

    /** @private */
    this.format = process.env.LOGS_PRETTY_PRINT ? prettyPrint : stringify;

    /** Alias for info */
    this.log = this.info;

    this.serializer = new Serializer(
      this.contextData, this.namespace, this.logLimit,
    );
  }

  /**
   * Returns a new logger with the same contextual information and a child namespace
   * @param {string} namespace - the namespace to be appended to the current one in the new instance
   */
  createChildLogger(namespace) {
    const prefix = this.namespace ? `${this.namespace}:` : '';

    return new Logger(this.contextData.context, `${prefix}${namespace}`, this.logPatterns);
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
   *  @private
   */
  output(message, additionalArguments, outputType = loggerLevels.log) {
    if (this.shouldSupressOutput(outputType)) return;

    const event = this.serializer.serialize(
      message, additionalArguments, outputType,
    );

    console.log(`${this.format(event)}`); // eslint-disable-line no-console
  }

  /** @private */
  shouldSupressOutput(outputType) {
    return [
      logLevelFilter({ logLevel: this.logLevel, outputType }),
      isEnabled(this.namespace, this.logPatterns),
    ].some(response => response !== true);
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
