#!/usr/bin/env ts-node

var program = require('commander');

var rabbi = require('../dist/lib/rabbi');

var path = require('path');

program
  .command('start [actorsDirectory]')
  .action(async (actorsDirectory) => {

    if (!actorsDirectory) {

      actorsDirectory = path.join(process.cwd(), 'actors');

      rabbi.startActorsDirectory(actorsDirectory);
      
    }

  });

program
  .parse(process.argv);

