[![Known Vulnerabilities](https://snyk.io/test/github/natura-cosmeticos/clio-nodejs-logger/badge.svg?targetFile=package.json)](https://snyk.io/test/github/natura-cosmeticos/clio-nodejs-logger?targetFile=package.json)
[![Build Status](https://travis-ci.org/natura-cosmeticos/clio-nodejs-logger.svg?branch=master)](https://travis-ci.org/natura-cosmeticos/clio-nodejs-logger)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/8426d68f7eac481c9f3ae07b8eb1805b)](https://www.codacy.com/app/handrus_1938/clio-nodejs-logger?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=natura-cosmeticos/clio-nodejs-logger&amp;utm_campaign=Badge_Grade)

# Clio Node.js Logger

## What For

This module offers a logger with context per request. So it's supporting correlation id, session id, etc in any point of your application. You just need to use `Logger.current`.

## How to use

Install the package on your project using either npm or yarn:

```bash
npm i '@naturacosmeticos/clio-nodejs-logger'

yarn add '@naturacosmeticos/clio-nodejs-logger'
```

Example:

```js
const Logger = require('@naturacosmeticos/clio-nodejs-logger');
const uuid = require('uuid/v4');

const appLogger = new Logger({
  context: {
    requestId: uuid(),
    // Any additional info that you want to include with every record
  },
  namespace: 'appLogger'
})

appLogger.info('Starting application', { someData });

const httpLogger = appLogger.createChildLogger('http');
httpLogger.info('Start GET on /', { someData });
httpLogger.error('Error processing GET on /', { someData });
```

By default all log namespaces are disabled. To enable them you must pass the
`LOG_NAMESPACES` environment variable with the logging patterns you want to show.

This variable follows the same semantics as the
[debug](http://npmjs.com/package/debug) library on npm.

By default the log object will be truncated* when it exceed 7kb and the log level is not debug. If you need to increase this limit, you can set environment variable `LOG_LIMIT` with the value in bytes (i.e.: 10000 = 10kb) or pass the limit in the Logger constructor: `new Logger({ ...options, logLimit: 10000 });`

_&ast; when the log object is truncated only the following attributes are logged: `context`, `level`, `message` and `timestamp`._

More details of how use this lib can be found in the docs, that can be generated running `npm run docs` or `yarn docs`.

## Features

Clio has the basic features of a logger library:

  * log levels: you can use `debug`, `error`, `log` and `warn` levels
  * namespaces: with namespaces you can control what namespaces should be logged using the same semantics as the
[debug](http://npmjs.com/package/debug)

Beyond those common features Clio has additional features:

  * Context per request: you can use [`domain`](https://nodejs.org/api/domain.html) and then `Logger.current` to use the same logger instance inside in your application. So we can have the same context and additional information in your log as: ` correlationId` and `sessionId`
  * Limit your log event size: when the log level is not debug the log object will have size limit of 7kb (you can increase passing a new limit in the logger constructor). This limit exists to avoid problems during log parsing and avoid usage of unnecessary resources (i.e.: when developer forgets log call during debugging).


## How to contribute

You can contribute submitting [pull requests](https://github.com/natura-cosmeticos/clio-nodejs-logger/pulls).

### Setup

Run `yarn`.

### Testing

Just run `yarn test`.


### Lint

To verify if any lint rule was broken run: `yarn lint`.
