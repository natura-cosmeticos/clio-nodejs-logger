const { Util: { AsyncHooksStorage } } = require('@naturacosmeticos/node-base');
const assert = require('assert');
const { spy } = require('sinon');
const { lorem, random } = require('faker');
const domain = require('domain');

const Logger = require('../../src/logger');
const loggerLevels = require('../../src/levels');


function generateLoggerAttributes() {
  return {
    loggerContext: lorem.word(),
    loggerLogLevel: random.objectElement(loggerLevels),
    loggerLogLimit: random.number({ max: 7000, min: 5000 }),
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

      logger.error(message);

      const event = formatSpy.getCall(0).args[0];

      assert.equal(event.log_message, message);
    });

    it('return chunked logs in graylog format', () => {
      const [logger] = createLoggerWithLogFormat('graylog');
      const message = ''.padEnd(8000, 'x');

      const consoleSpy = spy(global.console, 'log');

      logger.info(message);

      const events = consoleSpy.getCalls();

      assert.ok(events.every(event => event.lastArg.includes('chunk')));
    });
  });

  context('with local storage arguments', () => {
    it('return log arguments passed to async hooks storage', () => {
      const expectedFakeArgs = {
        fakeAction: 'fakeActionValue',
        fakeEntity: 'fakeEntityValue',
      };

      Logger.current().setArguments(expectedFakeArgs);

      const fakeArgs = AsyncHooksStorage.getEntry('logArguments');

      assert.equal(fakeArgs, expectedFakeArgs);
    });
  });

  context('suppressing output via log level', () => {
    function createLoggerWithLogLevel(logLevel, extraParameters = {}) {
      const logger = new Logger({
        context: {},
        logLevel,
        logLimit: 7000,
        logPatterns: '*',
        namespace: '',
        ...extraParameters,
      });

      return [logger, spy(logger, 'format')];
    }

    const loggerMethods = ['debug', 'info', 'warn', 'error'];

    it('does not suppress any calls', () => {
      const [debugLevelLogger, loggerFormatSpy] = createLoggerWithLogLevel(loggerLevels.debug);

      loggerMethods.forEach(method => debugLevelLogger[method](lorem.sentence()));

      assert.equal(loggerFormatSpy.callCount, 4);
    });

    it('suppresses debug calls', () => {
      const [errorLevelLogger, loggerFormatSpy] = createLoggerWithLogLevel(loggerLevels.log);

      loggerMethods.forEach(method => errorLevelLogger[method](lorem.sentence()));

      assert.equal(loggerFormatSpy.callCount, 3);
    });

    it('suppresses debug and info calls', () => {
      const [errorLevelLogger, loggerFormatSpy] = createLoggerWithLogLevel(loggerLevels.warn);

      loggerMethods.forEach(method => errorLevelLogger[method](lorem.sentence()));

      assert.equal(loggerFormatSpy.callCount, 2);
    });

    it('suppresses all but error calls', () => {
      const [infoLevelLogger, loggerFormatSpy] = createLoggerWithLogLevel(loggerLevels.error);

      loggerMethods.forEach(method => infoLevelLogger[method](lorem.sentence()));

      assert.equal(loggerFormatSpy.callCount, 1);
    });

    it('suppresses as log level error if only logPattern is given', () => {
      const logger = new Logger({ logPatterns: '*', namespace: 'a' });
      const loggerFormatSpy = spy(logger, 'format');

      loggerMethods.forEach(method => logger[method](lorem.sentence()));
      assert.equal(loggerFormatSpy.callCount, 1);
    });

    it('flip suppresses debug and error calls', () => {
      const [errorLevelLogger, loggerFormatSpy] = createLoggerWithLogLevel(loggerLevels.warn, {
        flipLevelPattern: 'should log ever',
      });

      loggerMethods.forEach(method => errorLevelLogger[method]({ flip: 'should log ever' }));

      assert.equal(loggerFormatSpy.callCount, 4);
    });
  });

  context('creating an instance of logger with child namespace', () => {
    it('returns logger instance with child namespace', () => {
      const loggerNamespace = lorem.word();
      const loggerChildNamespace = lorem.word();
      const expectedNamespace = `${loggerNamespace}:/${loggerChildNamespace}`;

      const domainLogger = new Logger({ namespace: loggerNamespace });
      const currentDomain = domain.create();

      currentDomain.logger = domainLogger;

      currentDomain.run(() => {
        const childNamespace = Logger.current().createChildLogger(loggerChildNamespace);

        assert.equal(childNamespace.namespace, expectedNamespace);
      });
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
