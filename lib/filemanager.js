const EventEmitter = require('events');
const chokidar = require('chokidar');
const chalk = require('chalk');

const { VoiceRecordingState } = require('./types');
const VoiceFile = require('./voiceFile');
const { upload: uploadToS3 } = require('./aws/s3');
const { requestTranscription, getTranscription } = require('./aws/transcribe');

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
    console.log(chalk.yellow(`FileManager now listening to: ${this._path} for changes..`));
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
      console.log(`Recording complete: ${lastFile.filename}. Duration: ${lastFile.duration}`);
      this.processFile(lastFile);
    }

    const file = new VoiceFile(path, VoiceRecordingState.RECORDING);
    this._files.push(file);
  }

  /**
   * Processes a new voice file.
   * @param {string} file
   */
  async processFile(file) {
    let transResults;
    try {
      console.log(`Uploading to S3: ${file.filename}`);
      file.s3Location = await uploadToS3(file.filepath);
      file.state = VoiceRecordingState.UPLOADED;

      console.log(`Starting Transcribe job for ${file.filename}`);
      const jobName = await requestTranscription(file);
      file.state = VoiceRecordingState.TRANSCRIBING;

      console.log(`Polling for transcription for job: ${jobName}`);
      transResults = await getTranscription(jobName);
      file.state = VoiceRecordingState.TRANSCRIBED;
    } catch (e) {
      console.error(chalk.red(`Error transcribing: ${e.message}`));
      file.state = VoiceRecordingState.ERROR;
      return;
    }

    file.state = VoiceRecordingState.TRANSCRIBED;

    // TODO: delete both s3 files

    console.log(`TRANSCRIPTION DONE! ${transResults.transcripts[0].transcription}`);
  }

  _fileChanged(path) {
    console.log(`File changed: ${path}`);
  }

  _error(error) {
    console.error(`Error: ${error.message}`);
  }
}

module.exports = FileManager;
