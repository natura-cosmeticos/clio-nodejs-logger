# Node Logger

## What For

This module offers a logger with context per request. So it's supporting correlation id, session id, etc in any point of your application. You just need to use `Logger.current`.

## How to use

Install the package on your project using either npm or yarn:

```bash
npm i --save-dev '@naturacosmeticos/node-logger'

yarn add -D '@naturacosmeticos/node-logger'
```

Example:

```js
const Logger = require('@naturacosmeticos/node-logger');
const uuid = require('uuid/v4');
const context = {
  requestId: uuid(),
  // Any additional info that you want to include with every record
};
const namespace = '';
const logAllMessages = false;
const logger = new Logger(context, namespace, logAllMessages);

const appLogger = logger.createChildLogger('app');
appLogger.info('Starting application', { someData });

const httpLogger = logger.createChildLogger('http');
httpLogger.info('Start GET on /', { someData });
httpLogger.error('Error processing GET on /', { someData });
```

By default all log namespaces are disabled. To enable them you must pass the
`LOG_NAMESPACES` environment variable with the logging patterns you want to show.

This variable follows the same semantics as the
[debug](http://npmjs.com/package/debug) library on npm.

More details of how use this lib can be found in the docs, that can be generated running `npm run docs` or `yarn docs`.

## How to contribute

You can contribute submitting [pull requests](https://github.com/natura-cosmeticos/node-logger/pulls).

### Setup

Run `yarn`.

### Testing

Just run `yarn test`.


### Lint

To verify if any lint rule was broken run: `yarn lint`.
