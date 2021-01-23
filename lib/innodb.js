const System = require('./innodb/system');

class InnoDB {
  constructor () {
    this.system = new System();
  }
}

module.exports = InnoDB;
