const { resolve } = require('path');
const fs = require('fs');
const YAML = require('yaml');

let _config;

/**
 * Returns the a configuration object which contains values from `config.yml`
 * @returns Object with configuration values
 */
module.exports.getConfig = () => {
  if (!_config) {
    const configContents = fs.readFileSync(resolve(__dirname, '..', '..', 'config.yml'), 'utf8');
    _config = YAML.parse(configContents);
  }

  return _config;
};

/**
 * Returns a promise that sleeps the specified duration
 * @param {number} ms - How long to pause, in milliseconds
 * @returns Promise
 */
module.exports.sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Generates an AWS service configuration including API keys.
 * @returns {object} AWS service configuration.
 */
module.exports.getAWSConfig = () => {
  return {
    accessKeyId: module.exports.getConfig().aws['access_key'],
    secretAccessKey: module.exports.getConfig().aws['secret_key'],
    region: module.exports.getConfig().aws['region'],
  };
};

/**
 * Executes a polling function until it validates complete.
 * @param {function} fn - Function to execute on each poll.
 * @param {function} validate - Validate function that receive's poll functions output and determines completion.
 * @param {int} interval - Frequenct of polling.
 * @param {*} maxAttempts - Number of attempts before failure (optional).
 * @returns Results of poll function.
 */
module.exports.poll = async (fn, validate, interval, maxAttempts) => {
  let attempts = 0;

  const executePoll = async (resolve, reject) => {
    let result;

    try {
      result = await fn();
    } catch (e) {
      return reject(e);
    }

    attempts++;

    if (validate(result)) {
      return resolve(result);
    } else if (maxAttempts && attempts === maxAttempts) {
      return reject(new Error(`Exceeded max attempts (${maxAttempts})`));
    } else {
      setTimeout(executePoll, interval, resolve, reject);
    }
  };

  return new Promise(executePoll);
};

/**
 * Returns the current date in format YYYY-MM-DD
 * @returns Date as string
 */
module.exports.getDate = () => {
  return new Date().toISOString().split('T')[0];
};