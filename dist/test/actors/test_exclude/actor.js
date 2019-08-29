"use strict";
/* implements rabbi actor protocol */
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
const __1 = require("../../..");
function start() {
    return __awaiter(this, void 0, void 0, function* () {
        __1.Actor.create({
            exchange: 'rabbi',
            routingkey: '',
            queue: '',
            schema: __1.Joi.object() // optional, enforces validity of json schema
        })
            .start((channel, msg, json) => __awaiter(this, void 0, void 0, function* () {
            __1.log.info(msg.content.toString());
            __1.log.info(json);
            channel.ack(msg);
        }));
    });
}
exports.start = start;
if (require.main === module) {
    start();
}
//# sourceMappingURL=actor.js.map