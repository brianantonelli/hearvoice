// const { promisify } = require('util');
// const opened = require('@ronomon/opened');

// const _isOpen = promisify(opened.file);

// /**
//  * Checks if a file is in-use by another process.
//  * @param {string} file - File to check
//  * @returns If file is in-use
//  */
// module.exports.isOpen = (file) => {
//   return new Promise((resolve, reject) => {
//     opened.file(file, (error, hashTable) => {
//       if (error) reject(error);
//       resolve(hashTable[file]);
//     });
//   });
//   // return await _isOpen(file);
// };
