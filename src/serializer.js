const os = require('os');
const sizeof = require('object-sizeof');

const loggerLevels = require('./levels');

module.exports = class Serializer {
  constructor(contextData, namespace, logLimit) {
    this.contextData = contextData;
    this.namespace = namespace;
    this.logLimit = logLimit;
  }

  serialize(message, additionalArguments, level) {
    const timestamp = new Date().toISOString();
    const event = this.event(message, additionalArguments, level, timestamp);

    if (level !== loggerLevels.debug && sizeof(event) > this.logLimit) {
      return this.truncatedEvent(level, timestamp);
    }

    return event;
  }

  /**
   *  @private
   */
  truncatedEvent(level, timestamp) {
    return {
      ...this.contextData,
      level,
      timestamp,
      truncated: true,
    };
  }

  /**
   *  @private
   */
  event(message, additionalArguments, level, timestamp) {
    return {
      ...additionalArguments,
      ...this.contextData,
      level,
      message,
      timestamp,
      namespace: this.namespace,
      uptime: os.uptime(),
    };
  }
};
