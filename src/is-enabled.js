/** @private */
function match(namespace, pattern) {
  const regex = new RegExp(pattern.replace('*', '.*'));

  if (pattern === '') return false;

  return regex.test(namespace);
}

/** @private */
module.exports = (namespace, enabledNamespaces) => {
  const patterns = enabledNamespaces.split(',');
  const excludingPatterns = patterns.filter(pattern => pattern.startsWith('-'));
  const includingPatterns = patterns.filter(pattern => !pattern.startsWith('-'));

  if (excludingPatterns.some(pattern => match(namespace, pattern.substring(1)))) {
    return false;
  }

  if (includingPatterns.some(pattern => match(namespace, pattern))) {
    return true;
  }

  return false;
};
