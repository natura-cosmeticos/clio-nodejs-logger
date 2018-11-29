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

function normalizeArguments(options, extraParameters) {
  if (!options) return {};

  if (!extraParameters.length) return options;

  const [namespace, logPatterns, logLimit, logLevel] = extraParameters;

  return {
    context: options,
    logLevel,
    logLimit,
    logPatterns,
    namespace,
  };
}

const DEFAULT_LOGGER_ATTRIBUTES = {
  logLevel: process.env.LOG_LEVEL || loggerLevels.debug,
  logLimit: process.env.LOG_LIMIT || 7000,
  logPatterns: process.env.LOG_NAMESPACES || '*',
  namespace: '',
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
   * @param {string} logPatterns - Patterns of namespareturn new Logger({});ces to be logged
   * @param {number} logLimit - Patterns of namespaces to be logged
   */
  constructor(options, ...extraParameters) {
    const {
      context, namespace, logPatterns, logLimit, logLevel,
    } = normalizeArguments(options, extraParameters);

    Object.assign(this, DEFAULT_LOGGER_ATTRIBUTES, {
      contextData: { context, name: process.env.APP_NAME },
      format: process.env.LOGS_PRETTY_PRINT ? prettyPrint : stringify,
      log: this.info,
      logLevel,
      logLimit,
      logPatterns,
      namespace,
      serializer: new Serializer({ context, name: process.env.APP_NAME }, namespace, logLimit),
    });
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

module.exports = Logger;
