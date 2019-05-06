const os = require('os');

module.exports = class Serializer {
  constructor(contextData, namespace, logLimit) {
    this.contextData = contextData;
    this.namespace = namespace;
    this.logLimit = logLimit;
  }

  serialize(message, additionalArguments, level) {
    const timestamp = new Date().toISOString();
    const event = this.event(message, additionalArguments, level, timestamp);

    return event;
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
      namespace: this.namespace,
      timestamp,
      uptime: os.uptime(),
    };
  }
};
