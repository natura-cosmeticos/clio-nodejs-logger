const {
  debug, error, warn, log,
} = require('./levels');

/** @private */
const LOG_LEVEL = Object.freeze([debug, log, warn, error]);

/** @private */
const levelOutputMatchers = [
  function debugOutput({ logLevel, outputType }) {
    return logLevel === debug && LOG_LEVEL.includes(outputType);
  },
  function infoOutput({ logLevel, outputType }) {
    return logLevel === log && LOG_LEVEL.slice(1).includes(outputType);
  },
  function warnOutput({ logLevel, outputType }) {
    return logLevel === warn && LOG_LEVEL.slice(2).includes(outputType);
  },
  function errorOutput({ logLevel, outputType }) {
    return logLevel === error && LOG_LEVEL.slice(3).includes(outputType);
  },
];

/**
 * It matches logLevel and outputType and returns if log request
 * should or should not be logged
 * @private */
function logLevelFilter({ logLevel, outputType }) {
  return levelOutputMatchers.some(matcher => matcher({ logLevel, outputType }));
}

logLevelFilter.LOG_LEVEL = LOG_LEVEL;

module.exports = logLevelFilter;
