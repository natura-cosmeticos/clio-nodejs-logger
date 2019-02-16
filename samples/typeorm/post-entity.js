const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  columns: {
    id: {
      generated: true,
      primary: true,
      type: 'int',
    },
    title: {
      type: 'varchar',
    },
  },
  name: 'Post',
  tableName: 'posts',
});
