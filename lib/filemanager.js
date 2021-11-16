const EventEmitter = require('events');
const chokidar = require('chokidar');

const utils = require('./utils');

/**
 * File Manager
 */
class FileManager extends EventEmitter {
  /**
   *
   * @param {string} path - Path to monitor
   */
  constructor(path) {
    super();

    this._path = path;
    this._watcher;
  }

  /**
   * Start watching path for file changes.
   */
  start() {
    this._watcher = chokidar
      .watch(this.path, { persistent: true, awaitWriteFinish: true })
      .on('add', this._fileAdded)
      .on('change', this._fileChanged)
      .on('error', this._error);
  }

  async _fileAdded(path) {
    console.log(`File added: ${path}`);
    const isOpen = await utils.isOpen(path);
    console.log(`is file open? ${isOpen}`);
  }

  _fileChanged(path) {
    console.log(`File changed: ${path}`);
  }

  _error(error) {
    console.error(`Error: ${error.message}`);
  }
}

module.exports = FileManager;
