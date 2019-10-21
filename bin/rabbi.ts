#!/usr/bin/env ts-node

import * as program from 'commander';

var rabbi = require('../lib/rabbi');

var path = require('path');

var mkdirp = require('mkdirp');

var cp = require('cp-file');

program
  .command('start')
  .option('-e, --exclude [exclude]', 'List of actors to exclude')
  .option('-d, --directory [directory]', 'Path to directory')
  .action(async (args) => {

    var directory;

    if (args.directory) {

      if (args.directory.match(/^\//)) {

        directory = args.directory;

      } else {

        directory = path.join(process.cwd(), args.directory);

      }

    } else {

      directory  = path.join(process.cwd(), directory);
  
    }

    rabbi.startActorsDirectory(directory, {

      exclude: args.exclude.split(',')

    });

  });

program
  .command('actor <actor_name>')
  .option('-e, --exchange [exchange]', 'AMQP exchange')
  .option('-r, --routingkey [routingkey]', 'AMQP routing key')
  .option('-q, --queue [queue]', 'AMQP queue')
  .action(async (actorName, args) => {

    let p = path.join(process.cwd(), 'actors', actorName);

    mkdirp(p, async function() {

      let source = path.join(__dirname, '..', 'templates', 'actor.ts');

      let destination = path.join(p, 'actor.ts');

      await cp(source, destination); 

      console.log('actor file created at', destination);
      
    });

  });

program
  .parse(process.argv);

