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
    const configContents = fs.readFileSync(resolve('..', 'config.yml'), 'utf8');
    _config = YAML.parse(configContents);
  }

  return _config;
};
