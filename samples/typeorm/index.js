const sqlite3 = require('sqlite3');
const typeorm = require('typeorm');
const config = require('./config');
const Logger = require('../../index');

const db = new sqlite3.Database('data.sqlite');

function databaseSetup(callback) {
  const query = `
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY,
      title TEXT
    )
  `;

  db.serialize(() => {
    db.run(query, () => {
      callback();
      db.close();
    });
  });
}

async function savePosts(connection) {
  const post = {
    title: 'TypeORM with Clio',
  };

  const postRepository = connection.getRepository('Post');

  await postRepository.save(post);
}

function handleError(error) {
  Logger.current().error(error);
}

databaseSetup(() => {
  typeorm.createConnection(config).then(savePosts).catch(handleError);
});

// to run: LOG_NAMESPACES=* node index.js
