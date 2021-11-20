const Database = require('./db');
const { getDate } = require('../utils');

/**
 * Interface to Postgres for voice/word analytics.
 */
class VoiceDAO {
  constructor() {
    this._db = new Database();
  }

  /**
   * Persists a collection of words and their occurrences to Postgres.
   * @param {object} words - Map of word occurrences keyed by word.
   */
  async addWords(words) {
    const client = await this._db.getClient();
    const today = getDate();
    const keys = Object.keys(words);

    console.log(`Persisting ${keys.length} words to Postgres..`);

    for (let i = 0, l = keys.length; i < l; i++) {
      const word = keys[i];
      const count = words[keys[i]];

      // check if its a new word for today
      const results = await client.query('SELECT occurrences FROM words WHERE word = $1 AND heard_on = $2', [
        word,
        today,
      ]);

      // existing word
      if (results.rowCount > 0) {
        const newValue = parseInt(results.rows[0].occurrences) + count;
        await client.query('UPDATE words SET occurrences = $1 WHERE word = $2 AND heard_on = $3', [
          newValue,
          word,
          today,
        ]);
      }
      // new word
      else {
        await client.query('INSERT INTO words(word, occurrences, heard_on) VALUES($1, $2, $3)', [word, count, today]);
      }
    }

    await client.release();
  }
}

module.exports = VoiceDAO;
