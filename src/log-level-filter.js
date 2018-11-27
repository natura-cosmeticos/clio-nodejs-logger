const {
  debug, error, warn, log,
} = require('./levels');

const LOG_LEVEL = Object.freeze([debug, error, warn, log]);

const debugOutput = ({ logLevel, outputType }) => (
  logLevel === debug && LOG_LEVEL.includes(outputType)
);

const errorOutput = ({ logLevel, outputType }) => (
  logLevel === error && LOG_LEVEL.slice(1).includes(outputType)
);

const warnOutput = ({ logLevel, outputType }) => (
  logLevel === warn && LOG_LEVEL.slice(2).includes(outputType)
);

const infoOutput = ({ logLevel, outputType }) => (
  logLevel === log && outputType === log
);

module.exports = function logLevelFilter({ logLevel, outputType }) {
  if (debugOutput({ logLevel, outputType })
    || errorOutput({ logLevel, outputType })
    || warnOutput({ logLevel, outputType })
    || infoOutput({ logLevel, outputType })) {
    return true;
  }

  return false;
};

module.exports.LOG_LEVEL = LOG_LEVEL;
