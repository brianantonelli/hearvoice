/**
 * Represents the state of a voice recording.
 */
module.exports.VoiceRecordingState = Object.freeze({
  /**
   * Currently recording.
   */
  RECORDING: Symbol('recording'),

  /**
   * Finished recording and written to disk.
   */
  SAVED: Symbol('saved'),

  /**
   * Uploaded to S3.
   */
  UPLOADED: Symbol('uploaded'),

  /**
   * Currently being transcribed.
   */
  TRANSCRIBING: Symbol('transcribing'),

  /**
   * Transcribed.
   */
  TRANSLATED: Symbol('translated'),

  /**
   * Unknown
   */
  UNKNOWN: Symbol('unknown'),
});
