const stringify = require('json-stringify-safe');
const { TextEncoder, TextDecoder } = require('util');
const AsyncHooksStorage = require('@naturacosmeticos/async-hooks-storage');
const uuid = require('uuid/v4');

const correlationIdName = 'correlation-id';

// eslint-disable-next-line max-lines-per-function
const hasProperty = (input, targetProperty) => {
  let hasTargetProperty = false;

  const iterateObject = (inputObj) => {
    const keys = Object.keys(inputObj);

    for (let counter = 0; counter < keys.length; counter += 1) {
      const currentKey = keys[counter];

      if (currentKey === targetProperty) {
        hasTargetProperty = true;
        break;
      }

      if (typeof inputObj[currentKey] === 'object') iterateObject(inputObj[currentKey]);
    }
  };

  iterateObject(input);

  return hasTargetProperty;
};

const getCorrelationId = () => {
  const storedCorrelationId = AsyncHooksStorage.getEntry(correlationIdName);

  if (!storedCorrelationId) return `miss_${uuid()}`;

  return storedCorrelationId;
};

const exposeFields = (event, fieldsToExpose) => {
  const json = stringify(event);

  const exposed = fieldsToExpose.reduce((resultantFields, field) => {
    const regExp = new RegExp(`(?:.*${field.fieldName}"?[:\\s]*["']?)([^"']*)(.*)`);
    const accumulatedResult = { ...resultantFields };

    if (json.match(regExp)) {
      accumulatedResult[field.alias || field.fieldName] = json.replace(regExp, '$1');
    }

    return accumulatedResult;
  }, {});

  if (hasProperty(exposed, correlationIdName)) return exposed;

  return { correlationId: getCorrelationId(), ...exposed };
};

const measureChunkMessage = (messageHeader, message, logLimit) => {
  const encoder = new TextEncoder();
  const flagSize = encoder.encode(stringify({ chunk: '999/999' })).length; // measure chunk marker
  const headerSize = encoder.encode(messageHeader).length;
  const messageFullSize = encoder.encode(stringify(stringify(message))).length;
  const bufferSize = logLimit - headerSize - flagSize;

  return {
    bufferSize,
    chunks: Math.ceil(messageFullSize / bufferSize),
  };
};

const chunkMessage = (messageHeader, message, logLimit) => {
  if (!logLimit) return Object.assign({}, messageHeader, { log_message: message });

  const header = Object.assign({}, messageHeader, { log_message: '@' });
  const chunkMeasure = measureChunkMessage(header, message, logLimit);
  const encodedMessage = new TextEncoder().encode(stringify(message));

  if (chunkMeasure.chunks === 1) return Object.assign({}, messageHeader, { log_message: message });
  const chunks = [];

  for (let chunk = 0; chunk < chunkMeasure.chunks; chunk += 1) {
    chunks.push(stringify({ ...header, chunk: `${chunk + 1}/${chunkMeasure.chunks}` })
      .replace('"@"', new TextDecoder()
        .decode(encodedMessage.slice(chunk * logLimit, (chunk + 1) * logLimit))));
  }

  return { chunked: true, chunks };
};

module.exports = function graylog(event = {}, fieldsToExpose = [], logLimit) {
  const {
    level, message, timestamp, ...eventForGraylog
  } = event;

  const messageHeader = Object.assign(eventForGraylog, {
    ...exposeFields(event, fieldsToExpose),
    log_level: level,
    log_timestamp: timestamp,
  });

  return chunkMessage(messageHeader, message, logLimit);
};
