const { Pool } = require('pg');

const { getConfig } = require('../utils');

/**
 * Database Connection Manager
 */
class Database {
  constructor() {
    this._pool = new Pool(getConfig().db);
  }

  /**
   * Performs a single query and returns the results.
   * @param {*} text - SQL (params in $# format)
   * @param {*} params - Parameters to pass
   * @returns Query results
   */
  async query(text, params) {
    const start = Date.now();
    const res = await this._pool.query(text, params);
    const duration = Date.now() - start;
    console.log('executed query', { text, params: JSON.stringify(params), duration, rows: res.rowCount });

    return res;
  }

  /**
   * Returns a PSQL client for performing batch queries. Automatically closes after 5 seconds of inactivity;
   * @returns PSQL Client
   */
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

module.exports = Database;
