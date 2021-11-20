const { resolve: resolvePath } = require('path');
const chalk = require('chalk');

const VoiceRecorder = require('./classes/voiceRecorder');
const FileManager = require('./classes/filemanager');
const Transcriber = require('./classes/transcriber');
const VoiceDAO = require('./classes/VoiceDAO');
const { sleep } = require('./utils');

const wavesPath = resolvePath('.', 'recordings');
const filename = 'hearvoice.wav';

(async () => {
  // TODO: clean up old recordings on start?
  const voiceRecorder = new VoiceRecorder();
  const fileManager = new FileManager(resolvePath(wavesPath, `*.${filename.split('.')[1]}`));
  const transcriber = new Transcriber();
  const voiceDAO = new VoiceDAO();

  voiceRecorder
    .on('data', (data) => {
      console.log(`data: ${data}`);
    })
    .on('error', (/**err*/) => {
      // console.error(`Sox Error: ${err}`);
    })
    .on('close', (code) => {
      console.log(chalk.green(`Voice recorder exited with code: ${code}. HearVoice will now exit.`));
      process.exit(code);
    });

  fileManager.on('recordingAvailable', async (voiceRecording) => {
    console.log(chalk.green(`File ready for processing: ${voiceRecording.filepath}`));
    await transcriber.transcribe(voiceRecording);
    await fileManager.remove(voiceRecording.filepath);
    await voiceDAO.addWords(voiceRecording.transcribedWords);

    console.log(chalk.green('Voice recording transcribed and results stored.'));
  });

  fileManager.start();
  await sleep(2000);
  voiceRecorder.listen(resolvePath(wavesPath, filename));
})();
