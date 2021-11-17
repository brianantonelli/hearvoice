const { basename } = require('path');

const { VoiceRecordingState } = require('./types');

/**
 * Represents a voice audio file state tracker.
 */
class VoiceFile {
  get filename() {
    return basename(this._filepath);
  }

  get filepath() {
    return this._filepath;
  }

  set filepath(filepath) {
    this._filepath = filepath;
  }

  get state() {
    return this._state;
  }

  set state(state) {
    if (state === VoiceRecordingState.SAVED) {
      this._endDate = new Date();
    }

    this._state = state;
  }

  get startDate() {
    return this._startDate;
  }

  set startDate(date) {
    this._startDate = date;
  }

  get endDate() {
    return this._endDate;
  }

  set endDate(date) {
    this._endDate = date;
  }

  get s3Location() {
    return this._s3Location;
  }

  set s3Location(s3Location) {
    this._s3Location = s3Location;
  }

  get transcribedText() {
    return this._transcribedText;
  }

  set transcribedText(transcribedText) {
    this._transcribedText = transcribedText;
  }

  get duration() {
    if (!this._endDate) return -1;

    return Math.abs((this._endDate.getTime() - this._startDate.getTime()) / 1000);
  }

  /**
   * Create a file audio file state tracker.
   * @param {string} filepath - Path to file on disk.
   * @param {VoiceRecordingState} state - Voice recording state.
   */
  constructor(filepath, state = VoiceRecordingState.UNKNOWN) {
    this.filepath = filepath;
    this.state = state;
    this.startDate = new Date();
    this.endDate = null;
    this.s3Location;
    this.transcribedText;
  }
}

module.exports = VoiceFile;
