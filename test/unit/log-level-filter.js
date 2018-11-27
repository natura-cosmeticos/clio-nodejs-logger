const assert = require('assert');
const { lorem } = require('faker');

const logLevelFilter = require('../../src/log-level-filter');

const [DEBUG, ERROR, WARN, LOG] = logLevelFilter.LOG_LEVEL;

describe('Log Level Filter', () => {
  context('level: debug', () => {
    it('returns true for every known output type', () => {
      const levelDebugCheck = outputType => logLevelFilter({ logLevel: DEBUG, outputType });

      assert.strictEqual(logLevelFilter.LOG_LEVEL.every(levelDebugCheck), true);
    });

    it('returns false if a non-existant output type is requested', () => {
      assert.strictEqual(logLevelFilter({ logLevel: DEBUG, outputType: lorem.word() }), false);
    });
  });

  context('level: error', () => {
    it('returns false when output type is debug', () => {
      assert.strictEqual(logLevelFilter({ logLevel: ERROR, outputType: DEBUG }), false);
    });

    it('returns true for error, warn and info output types', () => {
      const levelErrorCheck = outputType => logLevelFilter({ logLevel: ERROR, outputType });

      assert.strictEqual([ERROR, WARN, LOG].every(levelErrorCheck), true);
    });
  });

  context('level: warn', () => {
    const levelWarnCheck = outputType => logLevelFilter({ logLevel: WARN, outputType });

    it('retuns false for debug and error output types', () => {
      assert.strictEqual([DEBUG, ERROR].every(levelWarnCheck), false);
    });

    it('returns true for warn and info output types', () => {
      assert.strictEqual([WARN, LOG].every(levelWarnCheck), true);
    });
  });

  context('level: info', () => {
    const levelInfoCheck = outputType => logLevelFilter({ logLevel: LOG, outputType });

    it('returns false for every type but info', () => {
      assert.strictEqual([DEBUG, ERROR, WARN].every(levelInfoCheck), false);
    });

    it('returns true when info output type is requested', () => {
      assert.strictEqual(logLevelFilter({ logLevel: LOG, outputType: LOG }), true);
    });
  });
});
