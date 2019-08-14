#!/usr/bin/env node
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var program = require('commander');
var rabbi = require('../dist/lib/rabbi');
var path = require('path');
program
    .command('start [actorsDirectory]')
    .action((actorsDirectory) => __awaiter(this, void 0, void 0, function* () {
    if (!actorsDirectory) {
        actorsDirectory = path.join(process.cwd(), 'actors');
        rabbi.startActorsDirectory(actorsDirectory);
    }
}));
program
    .parse(process.argv);
//# sourceMappingURL=rabbi.js.map