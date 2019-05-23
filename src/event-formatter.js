const formatters = require('./formatters/');

module.exports = function eventFormatter(event, fieldsToExpose, format, logLimit) {
  const logFormat = formatters[format];

  if (!logFormat) return event;

  return logFormat(event, fieldsToExpose, logLimit);
};
