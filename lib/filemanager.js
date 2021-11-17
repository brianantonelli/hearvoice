const EventEmitter = require('events');
const chokidar = require('chokidar');

const { VoiceRecordingState } = require('./types');
const VoiceFile = require('./voiceFile');

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
    this._files = [];
  }

  /**
   * Start watching path for file changes.
   */
  start() {
    // console.log(`Watching: ${this._path} for changes..`);
    this._watcher = chokidar
      .watch(this._path, { persistent: true, awaitWriteFinish: true })
      .on('add', this._fileAdded.bind(this))
      .on('change', this._fileChanged.bind(this))
      .on('error', this._error.bind(this));
  }

  /**
   * Called when a new file is seen by watcher.
   * @param {string} path
   */
  async _fileAdded(path) {
    console.log(`File added to disk: ${path}`);

    // grab last file (if exists) and mark it as complete
    if (this._files.length) {
      const lastFile = this._files.slice(-1)[0];
      lastFile.state = VoiceRecordingState.SAVED;
      console.log(`File done: ${lastFile.filename}. Duration: ${lastFile.duration}`);
      this.emit('fileReady', lastFile);
    }

    const file = new VoiceFile(path, VoiceRecordingState.RECORDING);
    this._files.push(file);
  }

  _fileChanged(path) {
    console.log(`File changed: ${path}`);
  }

  _error(error) {
    console.error(`Error: ${error.message}`);
  }
}

module.exports = FileManager;
