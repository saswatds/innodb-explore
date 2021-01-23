#!/usr/bin/env node

// Set the CLI name appropriately
const yargs = require('yargs'),
  pkg = require('../package.json'),
  CLI_NAME = process.title = pkg.bin ? Object.keys(pkg.bin)[0] : pkg.name,
  
  InnoDB = require('../lib/innodb');

  yargs
  .scriptName(CLI_NAME)
  .command({
    command: '$0',
    handler: () => {
      new InnoDB();
    }
  })
  .wrap(yargs.terminalWidth())
  .alias('v', 'version')
  .version(pkg.version)
  .alias('h', 'help')
  .help()
  .argv;