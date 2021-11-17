const { spawn } = require('child_process');
const EventEmitter = require('events');
const chalk = require('chalk');

const { getConfig } = require('./utils');

/**
 * Voice Recorder
 */
class VoiceRecorder extends EventEmitter {
  constructor() {
    super();
  }

  /**
   * Runs Sox recorder and breaks files up by silence.
   * @param {string} file - Filename to save to. Will be suffixed with counter.
   * @param {string} silenceDuration - Time in seconds to consider silence
   * @param {int} cardNumber - Mic card number.
   */
  listen(file = 'record.wav', silenceDuration = '5.0', cardNumber = 3) {
    const threshold = 2.0;
    const abovePeriod = 1;
    const belowPeriod = 1;
    const soxArgs = [
      '-c2',
      '-r',
      getConfig().sample_rate_hertz,
      file,
      'silence',
      abovePeriod, // remove all silence above period
      0.1, // until N seconds of sound ...
      `${threshold}%`, // above N%
      belowPeriod, // below period
      silenceDuration, // stop when there is at least N seconds of silence ...
      `${threshold}%`, // ... below N%
      ':',
      'newfile',
      ':',
      'restart',
    ];

    console.log(chalk.yellow(`Starting Voice Recorder with args: ${soxArgs.join(' ')}`));

    const sox = spawn('rec', soxArgs, { env: { ...process.env, AUDIODEV: `hw:${cardNumber}`, SOX_OPTS: '-V2' } });

    sox.stdout.setEncoding('utf-8');
    sox.stderr.setEncoding('utf-8');

    sox.stdout.on('data', (data) => {
      this.emit('data', data);
    });

    sox.stderr.on('data', (error) => {
      this.emit('error', error, 'stderr');
    });

    sox.on('error', (error) => {
      this.emit('error', error, 'error');
    });

    sox.on('close', (code) => {
      this.emit('close', code);
    });
  }
}

module.exports = VoiceRecorder;
