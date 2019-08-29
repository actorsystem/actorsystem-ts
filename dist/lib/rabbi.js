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
require('dotenv').config();
const fs = require("fs");
const path = require("path");
const lodash_1 = require("lodash");
const actor_1 = require("./actor");
exports.Actor = actor_1.Actor;
const logger_1 = require("./logger");
exports.log = logger_1.log;
const amqp_1 = require("./amqp");
exports.getConnection = amqp_1.getConnection;
const Joi = require("joi");
exports.Joi = Joi;
function getDirectories(source) {
    return fs.readdirSync(source, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
}
exports.getDirectories = getDirectories;
const delay = require("delay");
exports.delay = delay;
function startActorsDirectory(directoryIndexPath, opts = {
    exclude: []
}) {
    return __awaiter(this, void 0, void 0, function* () {
        let directories = getDirectories(directoryIndexPath);
        var tmpHandle;
        let actors = directories.map(directory => {
            var dir = path.join(directoryIndexPath, directory);
            return fs.readdirSync(dir).reduce((actorFile, file) => {
                if (file === 'actor.ts') {
                    let a = path.join(dir, file);
                    return {
                        path: a,
                        name: directory
                    };
                }
            }, tmpHandle);
        });
        let shouldExclude = buildShouldExclude(opts.exclude);
        actors = lodash_1.reject(actors, actor => shouldExclude(actor.name));
        actors.forEach(actor => require(actor.path).start());
        return actors;
    });
}
exports.startActorsDirectory = startActorsDirectory;
function buildShouldExclude(excludeOpts) {
    let exclusions = lodash_1.reduce(excludeOpts, (exclusions, actorName) => {
        exclusions[actorName] = true;
        return exclusions;
    }, {});
    return function (actorName) {
        return exclusions[actorName];
    };
}
//# sourceMappingURL=rabbi.js.map