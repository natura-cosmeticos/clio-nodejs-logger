const _ = require('lodash');
const prettyjson = require('prettyjson');

/**
 * Default options for prettyjson
 */
const PrettyJsonDefaultOptions = Object.freeze({
  defaultIndentation: 4,
  inlineArrays: 1,
});

module.exports = function prettyPrint(event) {
  const header = `[${event.timestamp}]: [${event.message}]`;
  const eventDetails = _.omit(event, 'timestamp', 'message');
  const body = prettyjson
    .render(eventDetails, _.clone(PrettyJsonDefaultOptions))
    .replace(/\n/g, '\n\t');

  return `\n${header}\n\t${body}\n\n`;
};
