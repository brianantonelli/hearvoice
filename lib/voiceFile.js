const { VoiceRecordingState } = require('./types');

/**
 * Represents a voice audio file state tracker.
 */
class VoiceFile {
  get filename() {
    return this._filename;
  }

  set filename(filename) {
    this._filename = filename;
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

  get duration() {
    if (!this._endDate) return -1;

    return Math.abs((this._endDate.getTime() - this._startDate.getTime()) / 1000);
  }

  /**
   * Create a file audio file state tracker.
   * @param {string} filename - Filename on disk.
   * @param {VoiceRecordingState} state - Voice recording state.
   */
  constructor(filename, state = VoiceRecordingState.UNKNOWN) {
    this.filename = filename;
    this.state = state;
    this.startDate = new Date();
    this.endDate = null;
  }
}

module.exports = VoiceFile;
