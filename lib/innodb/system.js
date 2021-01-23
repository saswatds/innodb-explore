const DataDictionary = require('./datadictionary'),
  glob = require('glob'),
  chalk = require('chalk'),
  Space = require('./space');

// The space ID of the system space, always 0.
const SYSTEM_SPACE_ID = 0;

/**
 * A class representing an entire InnoDB system, having a system tablespace (ibdata1)
 * and any number of attached single-table tablespaces (.idb).
 */
class System {
  constructor () {
    // A hash of configuration options by configuration key
    this.config = new Map();

    // A hash of spaces by space-id
    this.spaces = new Map();

    // A set of space names for which a space file was not found
    this.orphans = new Set();

    // Set the current working directory as the data dir
    this.config.set('datadir', process.cwd());

    const spaceFiles = glob.sync('ibdata?').sort();

    // Add space files
    this.addSpace(spaceFiles);

    // InnoDb data dictionary for this system
    this.dataDictionary = new DataDictionary(this.systemSpace);
  }

  get systemSpace () {
    return this.spaces.get(SYSTEM_SPACE_ID);
  }

  addSpace (files) {
    if (!files.length) {
      console.error(chalk.red`ERR: Couldn't find any ibdata files in ${this.config.get('datadir')}`);

      return;
    }

    const space = new Space(files, this);

    this.spaces.set(space.id, space);
  }
}

module.exports = System;
