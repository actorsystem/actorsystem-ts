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
const lib_1 = require("../lib");
(() => __awaiter(this, void 0, void 0, function* () {
    // connects to AMQP_URL environment variable
    let actor = lib_1.Actor.create({
        exchange: 'orders',
        routingkey: 'ordercreated',
        queue: 'printorderreceipt'
    });
    yield actor.start((channel, msg) => __awaiter(this, void 0, void 0, function* () {
        lib_1.log.info('print order receipt', msg.content.toString());
        yield channel.ack(msg);
        lib_1.log.info('message acknowledged', msg.content.toString());
        setTimeout(() => {
            process.exit(0);
        }, 500);
    }));
    // publish example message with order uid as content
    let buffer = new Buffer('cf9418e8-eb0f-4c7e-88a3-4aca045a30f2');
    yield actor.channel.publish('orders', 'ordercreated', buffer);
}))();
//# sourceMappingURL=actor.js.map