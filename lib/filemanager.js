const EventEmitter = require('events');
const chokidar = require('chokidar');
const chalk = require('chalk');
const { unlink } = require('fs').promises;

const { VoiceRecordingState } = require('./types');
const VoiceRecording = require('./voiceRecording');

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
    this._recordings = [];
  }

  /**
   * Called when a new file is seen by watcher.
   * @param {string} path
   */
  async _fileAdded(path) {
    console.log(`File added to disk: ${path}`);

    // grab last file (if exists) and mark it as complete
    if (this._recordings.length) {
      const lastRecording = this._recordings.slice(-1)[0];
      lastRecording.state = VoiceRecordingState.SAVED;
      console.log(`Recording complete: ${lastRecording.filename}. Duration: ${lastRecording.duration}`);
      this.emit('recordingAvailable', lastRecording);
    }

    const voiceRecording = new VoiceRecording(path, VoiceRecordingState.RECORDING);
    this._recordings.push(voiceRecording);
  }

  _fileChanged(path) {
    console.log(`File changed: ${path}`);
  }

  _error(error) {
    console.error(`Error: ${error.message}`);
  }

  /**
   * Start watching path for file changes.
   */
  start() {
    console.log(chalk.yellow(`FileManager now listening to: ${this._path} for changes..`));
    this._watcher = chokidar
      .watch(this._path, { persistent: true, awaitWriteFinish: true })
      .on('add', this._fileAdded.bind(this))
      .on('change', this._fileChanged.bind(this))
      .on('error', this._error.bind(this));
  }

  /**
   * Deletes a file
   * @param {string} filepath
   */
  async remove(filepath) {
    try {
      await unlink(filepath);
    } catch (e) {
      console.error(chalk.red(`Error removing file (${filepath}): ${e.message}`));
    }
  }
}

module.exports = FileManager;
