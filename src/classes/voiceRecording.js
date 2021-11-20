const { basename } = require('path');

const { VoiceRecordingState } = require('../types');

/**
 * Represents a voice audio recording.
 */
class VoiceRecording {
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
    return this._state
      .toString()
      .replace(/Symbol\(|\)/g, '')
      .toUpperCase();
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

  get transcribedWords() {
    return this._transcribedWords;
  }

  set transcribedWords(transcribedWords) {
    this._transcribedWords = transcribedWords;
  }

  get s3LocationTranscription() {
    return this._s3LocationTranscription;
  }

  set s3LocationTranscription(s3LocationTranscription) {
    this._s3LocationTranscription = s3LocationTranscription;
  }

  get duration() {
    if (!this._endDate) return -1;

    return Math.abs((this._endDate.getTime() - this._startDate.getTime()) / 1000);
  }

  get s3Key() {
    return this._s3Key;
  }

  set s3Key(s3Key) {
    this._s3Key = s3Key;
  }

  toString() {
    return `State: ${this.state}\nFile: ${this.filepath}\nS3: ${this.s3Location}\n\nText: ${
      this.transcribedText
    }\nWords:\n${JSON.stringify(this.transcribedWords, null, 2)}`;
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
    this.s3Key;
    this.s3LocationTranscription;
    this.transcribedText;
    this.transcribedWords = {};
  }
}

module.exports = VoiceRecording;
