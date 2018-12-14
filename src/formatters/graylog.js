module.exports = function graylog(event = {}) {
  const {
    level, message, timestamp, ...eventForGraylog
  } = event;

  return Object.assign(eventForGraylog, {
    log_level: level,
    log_message: message,
    log_timestamp: timestamp,
  });
};
