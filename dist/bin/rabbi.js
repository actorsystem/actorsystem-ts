#!/usr/bin/env ts-node
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
var rabbi = require('../dist/lib/rabbi');
var path = require('path');
var mkdirp = require('mkdirp');
var cp = require('cp-file');
program
    .command('start [directory]')
    .action((directory = "actors") => __awaiter(this, void 0, void 0, function* () {
    let actorsDirectory = path.join(process.cwd(), directory);
    rabbi.startActorsDirectory(actorsDirectory);
}));
program
    .command('actor <actor_name>')
    .action((actorName) => __awaiter(this, void 0, void 0, function* () {
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