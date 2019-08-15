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
const fs = require("fs");
const path = require("path");
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
function startActorsDirectory(directoryIndexPath) {
    return __awaiter(this, void 0, void 0, function* () {
        let directories = getDirectories(directoryIndexPath);
        let actors = directories.map(directory => {
            var dir = path.join(directoryIndexPath, directory);
            return fs.readdirSync(dir).reduce((actorFile, file) => {
                if (file === 'actor.ts') {
                    actorFile = path.join(dir, file);
                }
                return actorFile;
            }, null);
        });
        actors.forEach(actor => {
            require(actor).start();
        });
    });
}
exports.startActorsDirectory = startActorsDirectory;
//# sourceMappingURL=rabbi.js.map