#!/usr/bin/env ts-node

const program = require('commander');

var rabbi = require('../lib/rabbi');

var path = require('path');

const cpFile = require('cp-file');

import { existsSync } from 'fs';

const mkdirp = require('mkdirp')

var cp = require('cp-file');

import { sendEmail } from '../lib/email';

program
  .command('email <create> <name>')
  .option('-d, --destination [destination]', 'destination email address')
  .option('-f, --from [from]', 'from email address')
  .option('-t, --template [template]', 'template to use')
  .option('-v, --variables [from]', 'from email address')
  .action(async (command, name, args) => {
    var variables;

    if (args.v) {
      variables = JSON.parse(args.v); 
    }

    switch (command) {
    case 'send':

      let resp = await sendEmail(name, args.destination, args.from, variables);

      console.log(resp);

      process.exit(0);

    default:

      break;
    }

    if (command !== 'create') {
      process.exit(0);
    }

    // check for directory, fail if already exists
    let directory = path.join(process.cwd(), 'emails', name);

    if (existsSync(directory)) {
      console.log(`rabbi> directory emails/${name} already exists`);
      process.exit(0);
    }

    mkdirp.sync(directory);

    let template = args.template || 'default';

    let emailDirectory = path.join(__dirname, '..', 'email');
    let templatesDirectory = path.join(emailDirectory, 'templates');

    cpFile.sync(
      path.join(templatesDirectory, `${template}.html`),
      path.join(directory, 'email.html')
    );

    cpFile.sync(
      path.join(emailDirectory, `index.js`),
      path.join(directory, 'index.js')
    );

    console.log(`rabbi> new email created at ${directory}`);

  });

program
  .command('start')
  .option('-a, --actors [actors]', 'List of actors to run')
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

      directory  = path.join(process.cwd(), 'actors');
  
    }

    var exclude = [];

    if (args.exclude) {

      exclude = args.exclude.split(',')

    }

    rabbi.startActorsDirectory(directory, { exclude });

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

