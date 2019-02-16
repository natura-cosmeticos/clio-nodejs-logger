const typeOrmLogger = require('./clio-logger');
const Post = require('./post-entity');

module.exports = {
  database: './data.sqlite',
  entities: [Post],
  logger: typeOrmLogger,
  logging: true,
  type: 'sqlite',
};
