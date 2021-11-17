const { resolve: resolvePath } = require('path');
const chalk = require('chalk');

const Sox = require('./sox');
const FileManager = require('./filemanager');

const wavesPath = resolvePath('.', 'recordings');
const filename = 'hearvoice.wav';

const run = async () => {
  const sox = new Sox();
  const fileManager = new FileManager(resolvePath(wavesPath, `*.${filename.split('.')[1]}`));

  sox.on('data', (data) => {
    console.log(`data: ${data}`);
  });

  sox.on('error', (err) => {
    // console.error(`Sox Error: ${err}`);
  });

  sox.on('close', (code) => {
    console.log(chalk.green(`Sox exited with code: ${code}`));
  });

  fileManager.on('fileReady', (file) => {
    console.log(chalk.yellow(`File ready for processing`, file));
  });

  console.log(chalk.green('Starting file monitor..'));
  fileManager.start();

  console.log(chalk.green('Starting Sox..'));
  sox.listen(resolvePath(wavesPath, filename), '5.0', 3);
};

run();
