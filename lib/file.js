/**
 * Represents a voice audio file state tracker.
 */
class File {
  get filename() {
    return this._filename;
  }

  set filename(filename) {
    this._filename = filename;
  }

  get isWriting() {
    return this._writing;
  }

  set writing(writing) {
    this._writing = writing;
  }

  get isProcessed() {
    return this._processed;
  }

  set processed(processed) {
    this._processed = processed;
  }

  /**
   * Create a file audio file state tracker.
   * @param {string} filename - Filename on disk
   */
  constructor(filename) {
    this._filename = filename;
    this._writing = false;
    this._processed = false;
  }
}

module.exports = File;
