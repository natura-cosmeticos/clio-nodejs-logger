const formatters = require('./formatters/');

module.exports = function eventFormatter(event, format) {
  const logFormat = formatters[format];

  if (!logFormat) return event;

  return logFormat(event);
};
