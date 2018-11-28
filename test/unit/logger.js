const assert = require('assert').strict;
const { spy } = require('sinon');
const { lorem } = require('faker');

const Logger = require('../../src/logger');
const loggerLevels = require('../../src/levels');

// TODO: Make it better
// TODO: Cover missing functions

describe('Logger', () => {
  context('supressing output via log level', () => {
    function createLoggerWithLogLevel(logLevel) {
      const logger = new Logger({}, '', '*', 7000, logLevel);

      return [logger, spy(logger, 'format')];
    }

    const loggerMethods = ['debug', 'error', 'warn', 'info'];

    it('does not supress any calls', () => {
      const [debugLevelLogger, loggerFormatSpy] = createLoggerWithLogLevel(loggerLevels.debug);

      loggerMethods.forEach(method => debugLevelLogger[method](lorem.sentence()));

      assert.equal(loggerFormatSpy.callCount, 4);
    });

    it('supresses debug calls', () => {
      const [errorLevelLogger, loggerFormatSpy] = createLoggerWithLogLevel(loggerLevels.error);

      loggerMethods.forEach(method => errorLevelLogger[method](lorem.sentence()));

      assert.equal(loggerFormatSpy.callCount, 3);
    });

    it('supresses debug and error calls', () => {
      const [errorLevelLogger, loggerFormatSpy] = createLoggerWithLogLevel(loggerLevels.warn);

      loggerMethods.forEach(method => errorLevelLogger[method](lorem.sentence()));

      assert.equal(loggerFormatSpy.callCount, 2);
    });

    it('supresses all but log/info calls', () => {
      const [infoLevelLogger, loggerFormatSpy] = createLoggerWithLogLevel(loggerLevels.log);

      loggerMethods.forEach(method => infoLevelLogger[method](lorem.sentence()));

      assert.equal(loggerFormatSpy.callCount, 1);
    });
  });
});
