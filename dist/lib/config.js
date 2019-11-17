"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const fs_1 = require("fs");
// check for .rabbi/config.ts file to override defaults
let configDirectory = path_1.join(process.cwd(), '.rabbi');
let configFile = path_1.join(configDirectory, 'config.ts');
var config;
exports.config = config;
if (fs_1.lstatSync(configDirectory).isDirectory() && fs_1.lstatSync(configFile).isFile()) {
    exports.config = config = require(configFile);
}
else {
    exports.config = config = {
        hapi: {
            handlers: {
                directory: process.cwd()
            }
        }
    };
}
//# sourceMappingURL=config.js.map