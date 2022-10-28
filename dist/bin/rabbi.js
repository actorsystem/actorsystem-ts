#!/usr/bin/env ts-node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const program = require('commander');
var rabbi = require('../lib/rabbi');
var path = require('path');
const cpFile = require('cp-file');
const fs_1 = require("fs");
const mkdirp = require('mkdirp');
var cp = require('cp-file');
const email_1 = require("../lib/email");
program
    .command('email <create> <name>')
    .option('-d, --destination [destination]', 'destination email address')
    .option('-f, --from [from]', 'from email address')
    .option('-t, --template [template]', 'template to use')
    .option('-v, --variables [from]', 'from email address')
    .action((command, name, args) => __awaiter(void 0, void 0, void 0, function* () {
    var variables;
    if (args.v) {
        variables = JSON.parse(args.v);
    }
    switch (command) {
        case 'send':
            let resp = yield (0, email_1.sendEmail)(name, args.destination, args.from, variables);
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
    if ((0, fs_1.existsSync)(directory)) {
        console.log(`rabbi> directory emails/${name} already exists`);
        process.exit(0);
    }
    mkdirp.sync(directory);
    let template = args.template || 'default';
    let emailDirectory = path.join(__dirname, '..', 'email');
    let templatesDirectory = path.join(emailDirectory, 'templates');
    cpFile.sync(path.join(templatesDirectory, `${template}.html`), path.join(directory, 'email.html'));
    cpFile.sync(path.join(emailDirectory, `index.js`), path.join(directory, 'index.js'));
    console.log(`rabbi> new email created at ${directory}`);
}));
program
    .command('start')
    .option('-a, --actors [actors]', 'List of actors to run')
    .option('-e, --exclude [exclude]', 'List of actors to exclude')
    .option('-d, --directory [directory]', 'Path to directory')
    .action((args) => __awaiter(void 0, void 0, void 0, function* () {
    var directory;
    if (args.directory) {
        if (args.directory.match(/^\//)) {
            directory = args.directory;
        }
        else {
            directory = path.join(process.cwd(), args.directory);
        }
    }
    else {
        directory = path.join(process.cwd(), 'actors');
    }
    var exclude = [];
    if (args.exclude) {
        exclude = args.exclude.split(',');
    }
    rabbi.startActorsDirectory(directory, { exclude });
}));
program
    .command('actor <actor_name>')
    .option('-e, --exchange [exchange]', 'AMQP exchange')
    .option('-r, --routingkey [routingkey]', 'AMQP routing key')
    .option('-q, --queue [queue]', 'AMQP queue')
    .action((actorName, args) => __awaiter(void 0, void 0, void 0, function* () {
    let p = path.join(process.cwd(), 'actors', actorName);
    mkdirp(p, function () {
        return __awaiter(this, void 0, void 0, function* () {
            let source = path.join(__dirname, '..', 'templates', 'actor.ts');
            let destination = path.join(p, 'actor.ts');
            yield cp(source, destination);
            console.log('actor file created at', destination);
        });
    });
}));
program
    .parse(process.argv);
//# sourceMappingURL=rabbi.js.map