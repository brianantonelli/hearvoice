const { Pool } = require('pg');

const { getConfig, getDate } = require('../utils');

class Database {
  constructor() {
    this._pool = new Pool(getConfig().db);
  }

  async query(text, params) {
    const start = Date.now();
    const res = await this._pool.query(text, params);
    const duration = Date.now() - start;
    console.log('executed query', { text, params: JSON.stringify(params), duration, rows: res.rowCount });

    return res;
  }

  async getClient() {
    const client = await this._pool.connect();
    const query = client.query;
    const release = client.release;

    // set a timeout of 5 seconds, after which we will log this client's last query
    const timeout = setTimeout(() => {
      console.error('A client has been checked out for more than 5 seconds!');
      console.error(`The last executed query on this client was: ${client.lastQuery}`);
    }, 5000);

    // monkey patch the query method to keep track of the last query executed
    client.query = (...args) => {
      client.lastQuery = args;
      return query.apply(client, args);
    };

    client.release = () => {
      clearTimeout(timeout);

      // set the methods back to their old un-monkey-patched version
      client.query = query;
      client.release = release;
      return release.apply(client);
    };
    return client;
  }
}

(async () => {
  const db = new Database();
  const word = 'foo';

  try {
    const results = await db.query('SELECT occurrences FROM words WHERE word = $1 AND heard_on = $2', [
      word,
      getDate(),
    ]);

    if (results.rowCount > 0) {
      console.log(results.rows[0]);
      const newValue = parseInt(results.rows[0].occurrences) + 1;
      await db.query('UPDATE words SET occurrences = $1 WHERE word = $2 AND heard_on = $3', [
        newValue,
        word,
        getDate(),
      ]);
    } else {
      await db.query('INSERT INTO words(word, occurrences, heard_on) VALUES($1, $2, $3)', [word, 1, getDate()]);
    }

    const results2 = await db.query('select * from words');
    console.log(JSON.stringify(results2));
  } catch (e) {
    console.error(`Error: ${e.message}`, e);
  }
})();

// module.exports = Database;
