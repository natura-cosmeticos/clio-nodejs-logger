const assert = require('assert');
const faker = require('faker');

const { graylog } = require('../../../src/formatters/');

describe('graylog formatter', () => {
  let emptyOutput;

  before(() => {
    emptyOutput = { log_level: undefined, log_message: undefined, log_timestamp: undefined };
  });

  it('return object with log_level, log_message and log_timestamp undefined when event is not defined', () => {
    // given
    const expectedResult = Object.assign({}, emptyOutput);
    // when
    const formattedEvent = graylog();

    // then
    assert.deepEqual(formattedEvent, expectedResult);
  });

  it('transform level into log_level', () => {
    // given
    const level = 'debug';
    const expectedResult = Object.assign({}, emptyOutput, { log_level: level });
    const event = { level };
    // when
    const formattedEvent = graylog(event);

    // then
    assert.deepEqual(formattedEvent, expectedResult);
  });

  it('transform message into log_message', () => {
    // given
    const message = faker.lorem.sentence();
    const expectedResult = Object.assign({}, emptyOutput, { log_message: message });
    const event = { message };
    // when
    const formattedEvent = graylog(event);

    // then
    assert.deepEqual(formattedEvent, expectedResult);
  });

  it('transform timestamp into log_message', () => {
    // given
    const timestamp = new Date().getTime();
    const expectedResult = Object.assign({}, emptyOutput, { log_timestamp: timestamp });
    const event = { timestamp };
    // when
    const formattedEvent = graylog(event);

    // then
    assert.deepEqual(formattedEvent, expectedResult);
  });

  it('keep other attributes and add log prefix to level, message and timestamp attributes', () => {
    // given
    const level = 'info';
    const message = faker.lorem.sentence();
    const timestamp = new Date().getTime();
    const additionalAttributes = faker.random.objectElement();
    const expectedResult = {
      ...additionalAttributes,
      log_level: level,
      log_message: message,
      log_timestamp: timestamp,
    };
    const event = Object.assign({ level, message, timestamp }, additionalAttributes);
    // when
    const formattedEvent = graylog(event);

    // then
    assert.deepEqual(formattedEvent, expectedResult);
  });
});
