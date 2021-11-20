const chalk = require('chalk');
const { v4: uuidv4 } = require('uuid');

const { VoiceRecordingState } = require('../types');
const { upload: uploadToS3, remove: removeFromS3 } = require('../aws/s3');
const { requestTranscription, getTranscription } = require('../aws/transcribe');
const { getConfig, getFileSize } = require('../utils');

/**
 * Voice Transcriber
 */
class Transcriber {
  constructor() {}

  /**
   * Transcribes a voice recording. Updates recording with transcription results.
   * @param {VoiceRecording} recording
   * @retruns {VoiceRecording} recording
   */
  async transcribe(recording) {
    const voiceBucket = getConfig().aws['voice_bucket'];
    recording.s3Key = `${uuidv4()}.wav`;

    try {
      console.time('Transcribing');
      console.log(`Uploading ${getFileSize(recording.filepath)}MB recording to S3: ${recording.s3Key}`);
      recording.s3Location = await uploadToS3(recording.filepath, voiceBucket, recording.s3Key);
      recording.state = VoiceRecordingState.UPLOADED;

      console.log(`Starting Transcribe job for ${recording.s3Key}`);
      const jobName = await requestTranscription(recording);
      recording.state = VoiceRecordingState.TRANSCRIBING;

      console.log(`Polling for transcription for job: ${jobName}`);
      const transResults = await getTranscription(jobName);
      recording.state = VoiceRecordingState.TRANSCRIBED;

      this.processTranscriptionResults(recording, transResults);

      console.timeEnd('Transcribing');
    } catch (e) {
      console.error(chalk.red(`Error transcribing: ${e.message}`));
      recording.state = VoiceRecordingState.ERROR;
      return;
    } finally {
      console.log(`Removing voice file from S3: ${recording.s3Key}`);
      try {
        removeFromS3(voiceBucket, recording.s3Key);
      } catch (e) {
        console.error(`Error removing voice file from S3: ${e.message}`);
      }
    }

    return recording;
  }

  /**
   * Filters transcription results and
   * @param {VoiceRecording} recording - Voice recording to process for
   * @param {Object} results - Transcription results
   * @returns {VoiceRecording} Updated voice recording
   */
  processTranscriptionResults(recording, results) {
    if (!results || !results.transcripts.length) {
      return recording;
    }

    recording.transcribedText = results.transcripts[0].transcript;

    recording.transcribedWords = results.items
      .filter((i) => {
        // TODO: will alternatives ever have more then one result?
        return i.type === 'pronunciation' && parseFloat(i.alternatives[0].confidence) > 0.9;
      })
      .reduce((accum, match) => {
        const word = match.alternatives[0].content.toLowerCase();
        if (!accum[word]) {
          accum[word] = 0;
        }
        accum[word]++;
        return accum;
      }, {});

    return recording;
  }
}

module.exports = Transcriber;
