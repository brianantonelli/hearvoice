const path = require('path');

const Sox = require('./sox');
const FileManager = require('./filemanager');

(() => {
  const wavesPath = path.join('.', 'recordings');

  console.log('Starting Sox..');
  console.log(`Writing to ${wavesPath}`);

  const sox = new Sox();
  const fileManager = new FileManager(wavesPath);

  sox.on('data', (data) => {
    console.log(`data: ${data}`);
  });

  sox.on('error', (err) => {
    // console.error(`Sox Error: ${err}`);
  });

  sox.on('close', (code) => {
    console.log(`Sox exited with code: ${code}`);
  });

  fileManager.start();
  sox.listen(path.join(wavesPath, 'hearvoice.wav'), '5.0', 3);
})();
