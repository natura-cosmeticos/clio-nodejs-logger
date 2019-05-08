const os = require('os');
const asyncLocalStorage = require('async-local-storage');

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
      ...asyncLocalStorage.get('logArguments'),
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
