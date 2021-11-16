const { spawn } = require('child_process');
const EventEmitter = require('events');

/**
 * Wrapper for the Sox library
 */
class Sox extends EventEmitter {
  constructor() {
    super();
  }

  /**
   * Runs Sox recorder and breaks files up by silence.
   * @param {string} file - Filename to save to. Will be suffixed with counter.
   * @param {string} silenceDuration - Time in seconds to consider silence. Float passed as string.
   * @param {int} cardNumber - Mic card number.
   */
  listen(file = 'record.wav', silenceDuration = '5.0', cardNumber = 3) {
    const sox = spawn(
      'rec',
      [
        '-c2',
        '-r',
        '48000',
        file,
        'silence',
        '1',
        '0.1',
        '1%',
        '1',
        silenceDuration,
        '1%',
        ':',
        'newfile',
        ':',
        'restart',
      ],
      { env: { ...process.env, AUDIODEV: `hw:${cardNumber}`, SOX_OPTS: '-V2' } }
    );

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

module.exports = Sox;
