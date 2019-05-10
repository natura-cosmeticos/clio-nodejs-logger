const stringify = require('json-stringify-safe');
const asyncLocalStorage = require('async-local-storage');
const { TextEncoder } = require('util');

const exposeFields = (event, fieldsToExpose) => {
  const json = stringify(event);


  const exposed = fieldsToExpose.reduce((resultantFields, field) => {
    const regExp = new RegExp(`(?:.*${field.fieldName}"?[:\\s]*["']?)([^"']*)(.*)`);
    const accumulatedResult = { ...resultantFields };

    if (json.match(regExp)) {
      accumulatedResult[field.alias || field.fieldName] = json.replace(regExp, '$1');
    }

    return { ...accumulatedResult, correlationId: asyncLocalStorage.get('correlationId') };
  }, {});

  return { ...exposed, correlationId: asyncLocalStorage.get('correlationId') };
};

const measureChunkMessage = (messageHeader, message, logLimit) => {
  const encoder = new TextEncoder();
  const flagSize = encoder.encode(stringify({ chunk: '999/999' })).length; // measure chunk marker
  const headerSize = encoder.encode(messageHeader).length;
  const messageFullSize = encoder.encode(stringify(stringify(message)));
  const bufferSize = logLimit - headerSize - flagSize;

  return {
    bufferSize,
    chunks: Math.ceil(messageFullSize / bufferSize),
  };
};

const chunkMessage = (messageHeader, message, logLimit) => {
  if (!logLimit) return Object.assign({}, messageHeader, { message });

  const header = Object.assign({}, messageHeader, { message: '@' });
  const chunkMeasure = measureChunkMessage(header, message, logLimit);
  const encodedMessage = new TextEncoder().encode(stringify(stringify(message)));

  if (chunkMeasure.chunks === 1) return Object.assign({}, messageHeader, { message });

  const chunks = [];

  for (let chunk = 0; chunk < chunkMeasure.chunks; chunk += 1) {
    chunks.push(
      stringify({ ...header, chunk: `${chunk}/${chunkMeasure.chunks}` })
        .replace('"@"', encodedMessage.slice(chunk * logLimit, (chunk + 1) * logLimit)),
    );
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
