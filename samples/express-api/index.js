const express = require('express');
const Logger = require('@naturacosmeticos/clio-nodejs-logger');

const clioMiddleware = require('./clio-middleware');
const loggingMiddleware = require('./logging-middleware');

const app = express();
const port = 3000;

app.use(clioMiddleware);
app.use(loggingMiddleware);

app.get('/', (req, res) => {
  Logger.current().log('Log inside / handle');
  res.send('Hello World!');
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

// to run: LOG_NAMESPACES=* node index.js
// to test log generation: curl localhost:3000
