const fs = require('fs'),
  path = require('path');
const Page = require('./page');

// InnoDB's default page size is 16KiB
const DEFAULT_PAGE_SIZE = 16 * 1024,

  // The default extent size is 1MiB defined originally as 64 pages
  DEFAULT_EXTENT_SIZE = 64 * DEFAULT_PAGE_SIZE;

class DataFile {
  constructor(filename, offset) {
    this.filename = filename;
    this.offset = offset
    
    this.file = fs.openSync(filename);
  }

  get size () {
    return fs.fstatSync(this.file).size;
  }

  get name () {
    let prefix = path.basename(path.dirname(this.filename));

    if(path.extname(this.filename) === '.ibd') {
      prefix += path.basename(this.filename);
    }

    return prefix;
  }

  read(offset, size, position = null) {
    const buffer = Buffer.alloc(size);

    fs.readSync(this.file,  buffer, offset, size, position);

    return buffer;
  }
}

class Space {
  constructor (files, system) {
    this.system = system;
    
    // The size of the space in bytes
    this.size = 0;

    // The size of each page in the space in bytes
    this.pageSize;

    // The number of pages in the space
    this.pages;

    this.dataFiles = files.map((filename) => {
      const file = new DataFile(filename, this.size);

      this.size += file.size;

      return file;
    });
  }

  /**
   * Return a string which can uniquely identify this space
   * 
   * @returns {String}
   */
  get name () {
    return this.dataFiles.map(({name}) => name).join(',');
  }

  /**
   * Get the appropriate datafile for the given offset
   * 
   * @returns {DataFile}
   */
  getDataFileForOffset(offset) {
    for (let file of this.dataFiles) {
      if(offset < file.size) {
        return file;
      }

      offset -= file.size
    }

    return null;
  }

  /**
   * Get the raw byte buffer of size bytes at offset in the file
   * 
   * @return {Buffer}
   */
  readAtOffset(offset, size) {
    if(!((offset < this.size) && (offset + size <= this.size))) {
      return null;
    }

    const dataFile = this.getDataFileForOffset(offset);

    return dataFile.read(offset - dataFile.offset, size);
  }

  /**
   * Read the File Space header flags
   */
  readFSPHeaderFlags () {
    // Read content off of page 0 of the system space
    const pageOffset = this.readAtOffset(4, 4).readUInt32BE(),
      pageType = this.readAtOffset(24, 2).readUInt16BE();
    
    // The FILL header should be initialized in page 0 to offset 0 and page type FSP_HDR (8).
    if(pageOffset !== 0 && pageType !== Page.TYPE.FSP_HDR) {
      throw new Error('Page 0 does not seem to be of type FSP_HDR');
    }

    // The space ID should be same in both FIL and FSP headers
    const filSpace = this.readAtOffset(34, 4).readUInt32BE(),
      fspSpace = this.readAtOffset(38, 4).readUInt32BE();

    if(filSpace !== fspSpace) {
      throw new Error('FIL and FSP space ids do not match');
    }

    const flags = this.readAtOffset(54, 4).readUInt32BE();

    // TODO: Decode the File space header
    return flags;
  }
}

module.exports = Space;
