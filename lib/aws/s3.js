const AWS = require('aws-sdk');
const { readFile } = require('fs').promises;
const { basename } = require('path');

const { getAWSConfig, getConfig } = require('../utils');

const s3 = new AWS.S3(getAWSConfig());

/**
 * Uploads a file to AWS S3.
 * @param {string} filePath
 * @returns S3 URL of uploaded file.
 */
module.exports.upload = async (filePath) => {
  const fileName = basename(filePath);
  const content = await readFile(filePath);
  const params = {
    Bucket: getConfig().aws['voice_bucket'],
    Key: fileName,
    Body: content,
  };

  const { Location: url } = await s3.upload(params).promise();

  return url;
};

/**
 * Retrieves the contents of a file from S3.
 * @param {string} bucket
 * @param {string} key
 * @returns Contents of file.
 */
module.exports.get = async (bucket, key) => {
  const data = await s3
    .getObject({
      Bucket: bucket,
      Key: key,
    })
    .promise();

  return data.Body.toString();
};
