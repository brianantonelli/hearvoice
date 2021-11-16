const { promisify } = require('util');
const { Opened } = require('@ronomon/opened');

const _isOpen = promisify(Opened);

/**
 * Checks if a file is in-use by another process.
 * @param {string} file - File to check
 * @returns If file is in-use
 */
module.exports.isOpen = async (file) => {
  return await _isOpen(file);
};
