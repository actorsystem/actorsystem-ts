"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config");
const handlers = requireHandlersDirectory(config_1.config.hapi.handlers.directory);
exports.handlers = handlers;
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
//# sourceMappingURL=handlers.js.map