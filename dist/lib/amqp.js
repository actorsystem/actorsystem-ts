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
const amqplib_1 = require("amqplib");
const logger_1 = require("./logger");
var connection;
var connecting = false;
require('dotenv').config();
function getConnection() {
    return __awaiter(this, void 0, void 0, function* () {
        while (connecting) {
            yield wait(100);
        }
        if (!connection) {
            connecting = true;
            connection = yield amqplib_1.connect(process.env.AMQP_URL);
            connecting = false;
            logger_1.log.info('bunnies.amqp.connected');
        }
        return connection;
    });
}
exports.getConnection = getConnection;
function wait(ms) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, ms);
    });
}
//# sourceMappingURL=amqp.js.map