const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const { getAWSConfig, getConfig, poll } = require('../utils');
const { get } = require('./s3');

const transcribe = new AWS.TranscribeService(getAWSConfig());
const pollFreq = parseFloat(getConfig().aws['trans_poll_freq']);
const transBucket = getConfig().aws['transcribe_bucket'];

/**
 * Submits a job to AWS Transcribe for the provided voice file.
 * @param {VoiceFile} file - Voice file to transcribe.
 * @returns {string} Transcription job name.
 */
module.exports.requestTranscription = async (file) => {
  const transcribeJob = await transcribe
    .startTranscriptionJob({
      LanguageCode: getConfig().language_code,
      Media: { MediaFileUri: file.s3Location },
      MediaFormat: 'wav',
      TranscriptionJobName: uuidv4(),
      MediaSampleRateHertz: getConfig().sample_rate_hertz,
      OutputBucketName: transBucket,
    })
    .promise();

  return transcribeJob.TranscriptionJob.TranscriptionJobName;
};

/**
 * Retrieves the transcription once available.
 * @param {string} job Transcription job name
 */
module.exports.getTranscription = async (jobName) => {
  const getTrans = async () => {
    return await transcribe.getTranscriptionJob({ TranscriptionJobName: jobName }).promise();
  };

  const isJobDone = (job) => {
    console.log(`${jobName} ==> ${job.TranscriptionJob.TranscriptionJobStatus}`);
    const status = job.TranscriptionJob.TranscriptionJobStatus;

    if (status === 'COMPLETED') {
      return true;
    } else if (status === 'FAILED') {
      console.error(`Transcription failed: ${job.TranscriptionJob.FailureReason}`);
      return true;
    } else if (!(status in ['QUEUED', 'IN_PROGRESS'])) {
      return true;
    }
  };

  await poll(getTrans, isJobDone, pollFreq, 30);
  const transResults = JSON.parse(await get(transBucket, `${jobName}.json`)).results;
  await deleteTranscriptionRequest(jobName);

  return transResults;
};

const deleteTranscriptionRequest = async (jobName) => {
  await transcribe.deleteTranscriptionJob({
    TranscriptionJobName: jobName,
  });
};
