/** @private */
function matchPattern(pattern) {
  if (pattern === '') return false;

  return new RegExp(pattern.replace('*', '.*')).test(this.namespace);
}

function createPatterns({ excludingPatterns, includingPatterns }, nextPattern) {
  if (nextPattern.startsWith('-')) {
    return {
      excludingPatterns: excludingPatterns.concat(nextPattern.substring(1)),
      includingPatterns,
    };
  }

  return {
    excludingPatterns,
    includingPatterns: includingPatterns.concat(nextPattern),
  };
}

/** @private */
module.exports = (namespace, enabledNamespaces) => {
  if (!enabledNamespaces) return false;

  const { excludingPatterns, includingPatterns } = enabledNamespaces
    .split(',')
    .reduce(createPatterns, { excludingPatterns: [], includingPatterns: [] });

  if (excludingPatterns.some(matchPattern, { namespace })) return false;

  if (includingPatterns.some(matchPattern, { namespace })) return true;

  return false;
};
