const EventEmitter = require('events');
const chokidar = require('chokidar');
const chalk = require('chalk');
const { unlink, stat } = require('fs').promises;

const { VoiceRecordingState } = require('../types');
const VoiceRecording = require('./voiceRecording');
const { getFileSize } = require('../utils');

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
    this._recordings = []; // TODO: do we need to periodically clean this up?
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

      const fsize = getFileSize(lastRecording.filepath);
      if (fsize < 1) {
        console.warn(chalk.yellow(`Recording (${lastRecording.filename}) was less than 1MB (${fsize}MB). Skipping.`));
        lastRecording.state = VoiceRecordingState.INVALID;
        this.remove(lastRecording.filepath);
      } else {
        this.emit('recordingAvailable', lastRecording);
      }
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

  async _getFileSize(path) {
    return (await stat(path)).size / this.bytes_per_mb;
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
