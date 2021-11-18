const AWS = require('aws-sdk');
const { readFile } = require('fs').promises;

const { getAWSConfig } = require('../utils');

const s3 = new AWS.S3(getAWSConfig());

/**
 * Uploads a file to AWS S3.
 * @param {string} filePath - Path of file to upload
 * @param {string} bucket - Bucket to upload to
 * @param {string} key - Object key to create
 * @returns S3 URL of uploaded file.
 */
module.exports.upload = async (filePath, bucket, key) => {
  const content = await readFile(filePath);
  const params = {
    Bucket: bucket,
    Key: key,
    Body: content,
  };

  const { Location: url } = await s3.upload(params).promise();

  return url;
};

/**
 * Retrieves the contents of a file from S3.
 * @param {string} bucket - Bucket to fetch from
 * @param {string} key - Key of file to read
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

/**
 * Removes an object from a bucket.
 * @param {*} bucket - Bucket to remove from
 * @param {*} key - Key of file to remove
 */
module.exports.remove = async (bucket, key) => {
  await s3
    .deleteObject({
      Bucket: bucket,
      Key: key,
    })
    .promise();
};
