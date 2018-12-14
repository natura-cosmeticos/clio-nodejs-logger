const assert = require('assert').strict;
const { spy } = require('sinon');
const { lorem, random } = require('faker');
const domain = require('domain');

const Logger = require('../../src/logger');
const loggerLevels = require('../../src/levels');

// TODO: Make it better
// TODO: Cover missing functions

function generateLoggerAttributes() {
  return {
    loggerContext: lorem.word(),
    loggerLogLevel: random.objectElement(loggerLevels),
    loggerLogLimit: random.number(),
    loggerNamespace: lorem.word(),
    loggerPattern: lorem.word(),
  };
}

describe('Logger', () => {
  context('with formatter', () => {
    const {
      loggerContext,
      loggerLogLevel,
      loggerLogLimit,
      loggerNamespace,
    } = generateLoggerAttributes();

    function createLoggerWithLogFormat(logFormat) {
      const logger = new Logger({
        context: loggerContext,
        logFormat,
        logLevel: loggerLogLevel,
        logLimit: loggerLogLimit,
        logPatterns: '*',
        namespace: loggerNamespace,
      });

      return [logger, spy(logger, 'format')];
    }


    it('return log in graylog format when logFormat is graylog', () => {
      const [logger, formatSpy] = createLoggerWithLogFormat('graylog');
      const message = lorem.sentence();

      logger.info(message);

      const event = formatSpy.getCall(0).args[0];

      assert.equal(event.log_message, message);
    });
  });
  context('suppressing output via log level', () => {
    function createLoggerWithLogLevel(logLevel) {
      const logger = new Logger({
        context: {},
        logLevel,
        logLimit: 7000,
        logPatterns: '*',
        namespace: '',
      });

      return [logger, spy(logger, 'format')];
    }

    const loggerMethods = ['debug', 'error', 'warn', 'info'];

    it('does not suppress any calls', () => {
      const [debugLevelLogger, loggerFormatSpy] = createLoggerWithLogLevel(loggerLevels.debug);

      loggerMethods.forEach(method => debugLevelLogger[method](lorem.sentence()));

      assert.equal(loggerFormatSpy.callCount, 4);
    });

    it('suppresses debug calls', () => {
      const [errorLevelLogger, loggerFormatSpy] = createLoggerWithLogLevel(loggerLevels.error);

      loggerMethods.forEach(method => errorLevelLogger[method](lorem.sentence()));

      assert.equal(loggerFormatSpy.callCount, 3);
    });

    it('suppresses as log level error if only logPattern is given', () => {
      const logger = new Logger({ logPatterns: '*' });
      const loggerFormatSpy = spy(logger, 'format');

      loggerMethods.forEach(method => logger[method](lorem.sentence()));
      assert.equal(loggerFormatSpy.callCount, 3);
    });

    it('suppresses debug and error calls', () => {
      const [errorLevelLogger, loggerFormatSpy] = createLoggerWithLogLevel(loggerLevels.warn);

      loggerMethods.forEach(method => errorLevelLogger[method](lorem.sentence()));

      assert.equal(loggerFormatSpy.callCount, 2);
    });

    it('suppresses all but log/info calls', () => {
      const [infoLevelLogger, loggerFormatSpy] = createLoggerWithLogLevel(loggerLevels.log);

      loggerMethods.forEach(method => infoLevelLogger[method](lorem.sentence()));

      assert.equal(loggerFormatSpy.callCount, 1);
    });
  });

  context('creating an instance of logger using legacy mode', () => {
    const {
      loggerContext,
      loggerLogLevel,
      loggerLogLimit,
      loggerNamespace,
      loggerPattern,
    } = generateLoggerAttributes();

    const legacyLogger = new Logger(
      loggerContext,
      loggerNamespace,
      loggerPattern,
      loggerLogLimit,
      loggerLogLevel,
    );

    it('has correct context', () => assert.equal(legacyLogger.contextData.context, loggerContext));
    it('has correct logLevel', () => assert.equal(legacyLogger.logLevel, loggerLogLevel));
    it('has correct logLimit', () => assert.equal(legacyLogger.logLimit, loggerLogLimit));
    it('has correct logPatterns', () => assert.equal(legacyLogger.logPatterns, loggerPattern));
    it('has correct namespace', () => assert.equal(legacyLogger.namespace, loggerNamespace));
  });

  context('creating an instance of logger using object options mode', () => {
    const {
      loggerContext,
      loggerLogLevel,
      loggerLogLimit,
      loggerNamespace,
      loggerPattern,
    } = generateLoggerAttributes();

    const logger = new Logger({
      context: loggerContext,
      logLevel: loggerLogLevel,
      logLimit: loggerLogLimit,
      logPatterns: loggerPattern,
      namespace: loggerNamespace,
    });

    it('has correct context', () => assert.equal(logger.contextData.context, loggerContext));
    it('has correct logLevel', () => assert.equal(logger.logLevel, loggerLogLevel));
    it('has correct logLimit', () => assert.equal(logger.logLimit, loggerLogLimit));
    it('has correct logPatterns', () => assert.equal(logger.logPatterns, loggerPattern));
    it('has correct namespace', () => assert.equal(logger.namespace, loggerNamespace));
  });

  context('requesting current context', () => {
    it('returns an instance without context', () => {
      assert.ok(Logger.current() instanceof Logger);
    });

    it('returns domain.logger when running inside a domain', () => {
      const domainLogger = new Logger({ namespace: lorem.word() });
      const currentDomain = domain.create();

      currentDomain.logger = domainLogger;

      currentDomain.run(() => {
        assert.deepEqual(Logger.current(), domainLogger);
      });
    });
  });
});
