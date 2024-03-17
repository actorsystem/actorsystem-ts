"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.startActorsDirectory = exports.requireHandlersDirectory = exports.Joi = exports.delay = exports.publish = exports.getChannel = exports.getConnection = exports.log = exports.Actor = exports.jToB = exports.init = exports.startActors = exports.getDirectories = exports.requireDirectory = exports.events = void 0;
require('dotenv').config();
const fs_1 = require("fs");
const path_1 = require("path");
const lodash_1 = require("lodash");
const actor_1 = require("./actor");
Object.defineProperty(exports, "Actor", { enumerable: true, get: function () { return actor_1.Actor; } });
const logger_1 = require("./logger");
Object.defineProperty(exports, "log", { enumerable: true, get: function () { return logger_1.log; } });
const amqp_1 = require("./amqp");
Object.defineProperty(exports, "getConnection", { enumerable: true, get: function () { return amqp_1.getConnection; } });
Object.defineProperty(exports, "getChannel", { enumerable: true, get: function () { return amqp_1.getChannel; } });
Object.defineProperty(exports, "publish", { enumerable: true, get: function () { return amqp_1.publish; } });
var events_1 = require("./events");
Object.defineProperty(exports, "events", { enumerable: true, get: function () { return events_1.events; } });
const Joi = __importStar(require("@hapi/joi"));
exports.Joi = Joi;
const delay = __importStar(require("delay"));
exports.delay = delay;
var require_1 = require("./require");
Object.defineProperty(exports, "requireDirectory", { enumerable: true, get: function () { return require_1.requireDirectory; } });
function getDirectories(source) {
    return (0, fs_1.readdirSync)(source, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
}
exports.getDirectories = getDirectories;
function startActors(actorNames = []) {
    actorNames.map(actorName => {
        return require((0, path_1.join)(process.cwd(), 'actors', actorName, 'actor.ts'));
    })
        .forEach(actor => actor.start());
}
exports.startActors = startActors;
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        let channel = yield (0, amqp_1.getChannel)();
        yield channel.assertExchange('rabbi.events', 'direct');
    });
}
exports.init = init;
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
function requireHandlersDirectory(dirname) {
    var handlers = require('require-all')({
        dirname,
        filter: /(.+)\.ts$/,
        map: function (name, path) {
            return name.split('_').map(p => {
                return capitalizeFirstLetter(p);
            })
                .join('');
        }
    });
    return handlers;
}
exports.requireHandlersDirectory = requireHandlersDirectory;
function jToB(json) {
    return Buffer.from(JSON.stringify(json));
}
exports.jToB = jToB;
function startActorsDirectory(directoryIndexPath, opts = {
    exclude: [],
    include: []
}) {
    return __awaiter(this, void 0, void 0, function* () {
        let directories = getDirectories(directoryIndexPath);
        var tmpHandle;
        let actors = directories.map(directory => {
            var dir = (0, path_1.join)(directoryIndexPath, directory);
            return (0, fs_1.readdirSync)(dir).reduce((actorFile, file) => {
                if (file === 'actor.ts') {
                    let a = (0, path_1.join)(dir, file);
                    return {
                        path: a,
                        name: directory
                    };
                }
                else {
                    return actorFile;
                }
            }, tmpHandle);
        });
        actors = (0, lodash_1.reject)(actors, a => !a);
        let shouldExclude = buildShouldExclude(opts.exclude || []);
        actors = (0, lodash_1.reject)(actors, actor => shouldExclude(actor.name));
        if (opts.include && opts.include.length > 0) {
            let included = buildIncluded(opts.include);
            actors = (0, lodash_1.filter)(actors, actor => included(actor.name));
        }
        actors.forEach(actor => require(actor.path).start());
        return actors;
    });
}
exports.startActorsDirectory = startActorsDirectory;
function buildShouldExclude(excludeOpts) {
    const exclusions = (0, lodash_1.reduce)(excludeOpts, (exclusions, actorName) => {
        exclusions[actorName] = true;
        return exclusions;
    }, {});
    return function (actorName) {
        return exclusions[actorName];
    };
}
function buildIncluded(includeOpts) {
    var inclusions = (0, lodash_1.reduce)(includeOpts, (inclusions, actorName) => {
        inclusions[actorName] = true;
        return inclusions;
    }, {});
    return function (actorName) {
        return inclusions[actorName];
    };
}
//# sourceMappingURL=rabbi.js.map