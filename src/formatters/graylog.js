const stringify = require('json-stringify-safe');

const exposeFields = (event, fieldsToExpose) => {
  const json = stringify(event);

  return fieldsToExpose.reduce((resultantFields, field) => {
    const regExp = new RegExp(`(?:.*${field.fieldName}"?[:\\s]*["']?)([^"']*)(.*)`);
    const accumulatedResult = { ...resultantFields };

    if (json.match(regExp)) {
      accumulatedResult[field.alias || field.fieldName] = json.replace(regExp, '$1');
    }

    return accumulatedResult;
  }, {});
};

module.exports = function graylog(event = {}, fieldsToExpose = []) {
  const {
    level, message, timestamp, ...eventForGraylog
  } = event;

  return Object.assign(eventForGraylog, {
    ...exposeFields(event, fieldsToExpose),
    log_level: level,
    log_message: message,
    log_timestamp: timestamp,
  });
};
