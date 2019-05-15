const assert = require('assert');
const faker = require('faker');

const { prettyPrint } = require('../../../src/formatters/');

describe('prettyPrint formatter', () => {
  let emptyOutput;

  before(() => {
    emptyOutput = {
      correlationId: null,
      log_level: undefined,
      log_message: undefined,
      log_timestamp: undefined,
    };
    // emptyOutput = { ...emptyOutput, log_message: undefined };
  });

  it('return pretty Print Log', () => {
    // given
    const expectedResult = '\n[undefined]: [undefined]\n\t\u001b[32mcorrelationId: \u001b[39m\u001b[90mnull\u001b[39m\n\n';
    // when
    const formattedEvent = prettyPrint(emptyOutput);

    // then
    assert.deepEqual(formattedEvent, expectedResult);
  });
});
