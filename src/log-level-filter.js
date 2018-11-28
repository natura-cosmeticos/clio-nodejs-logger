const {
  debug, error, warn, log,
} = require('./levels');

const LOG_LEVEL = Object.freeze([debug, error, warn, log]);

/** @private */
const levelOutputMatchers = [
  function debugOutput({ logLevel, outputType }) {
    return logLevel === debug && LOG_LEVEL.includes(outputType);
  },
  function errorOutput({ logLevel, outputType }) {
    return logLevel === error && LOG_LEVEL.slice(1).includes(outputType);
  },
  function warnOutput({ logLevel, outputType }) {
    return logLevel === warn && LOG_LEVEL.slice(2).includes(outputType);
  },
  function infoOutput({ logLevel, outputType }) {
    return logLevel === log && outputType === log;
  },
];

/** @private */
module.exports = ({ logLevel, outputType }) => (
  levelOutputMatchers.some(matcher => matcher({ logLevel, outputType }))
);

module.exports.LOG_LEVEL = LOG_LEVEL;
