#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const program = require("commander");
var rabbi = require('../lib/rabbi');
var path = require('path');
var mkdirp = require('mkdirp');
var cp = require('cp-file');
program
    .command('start')
    .option('-a, --actors [actors]', 'List of actors to run')
    .option('-e, --exclude [exclude]', 'List of actors to exclude')
    .option('-d, --directory [directory]', 'Path to directory')
    .action((args) => __awaiter(this, void 0, void 0, function* () {
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
        directory = path.join(process.cwd(), directory);
    }
    rabbi.startActorsDirectory(directory, {
        exclude: args.exclude.split(',')
    });
}));
program
    .command('actor <actor_name>')
    .option('-e, --exchange [exchange]', 'AMQP exchange')
    .option('-r, --routingkey [routingkey]', 'AMQP routing key')
    .option('-q, --queue [queue]', 'AMQP queue')
    .action((actorName, args) => __awaiter(this, void 0, void 0, function* () {
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