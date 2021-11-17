const { resolve: resolvePath } = require('path');
const chalk = require('chalk');

const VoiceRecorder = require('./voiceRecorder');
const FileManager = require('./filemanager');
const { sleep } = require('./utils');

const wavesPath = resolvePath('.', 'recordings');
const filename = 'hearvoice.wav';

const run = async () => {
  const voiceRecorder = new VoiceRecorder();
  const fileManager = new FileManager(resolvePath(wavesPath, `*.${filename.split('.')[1]}`));

  voiceRecorder
    .on('data', (data) => {
      console.log(`data: ${data}`);
    })
    .on('error', (err) => {
      // console.error(`Sox Error: ${err}`);
    })
    .on('close', (code) => {
      console.log(chalk.green(`Sox exited with code: ${code}`));
    });

  fileManager.on('fileReady', (file) => {
    console.log(chalk.green(`File ready for processing: ${file.filepath}`));
  });

  fileManager.start();
  await sleep(2000);
  voiceRecorder.listen(resolvePath(wavesPath, filename));
};

run();
