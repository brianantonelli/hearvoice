const AWS = require('aws-sdk');
const { readFile } = require('fs').promises;
const { basename } = require('path');
const { getConfig } = require('../utils');

AWS.config.credentials = new AWS.SharedIniFileCredentials({ profile: 'hearvoice' });
const s3 = new AWS.S3({ apiVersion: '2006-03-01' });

/**
 * Uploads a file to AWS S3.
 * @param {string} filePath
 * @returns S3 URL of uploaded file.
 */
module.exports.upload = async (filePath) => {
  // const bucket = `s3://${getConfig().aws['bucket']}`;
  const fileName = basename(filePath);
  const content = await readFile(filePath);
  const params = {
    Bucket: getConfig().aws['bucket'],
    Key: fileName,
    Body: content,
  };

  const url = await s3.upload(params).promise;

  return url;
};
