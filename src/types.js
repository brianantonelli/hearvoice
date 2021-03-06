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
   * Recording has been transcribed.
   */
  TRANSCRIBED: Symbol('transcribed'),

  /**
   * Transcription has been persisted to datastore.
   */
  PERSISTED: Symbol('persisted'),

  /**
   * Error encountered.
   */
  ERROR: Symbol('error'),

  /**
   * Invalid recording due to small size.
   */
  INVALID: Symbol('invalid'),

  /**
   * Unknown
   */
  UNKNOWN: Symbol('unknown'),
});
