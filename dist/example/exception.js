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
const rabbi_1 = require("../lib/rabbi");
const delay = require("delay");
(() => __awaiter(this, void 0, void 0, function* () {
    let actor = rabbi_1.Actor.create({
        exchange: 'orders',
        routingkey: 'ordercreated',
        queue: 'printorderreceipt',
    });
    var i = 0;
    yield actor.start((channel, msg, json) => __awaiter(this, void 0, void 0, function* () {
        if (i++ < 5) {
            throw new Error('this should be caught');
        }
        rabbi_1.log.info('print order receipt', msg.content.toString());
        return channel.ack(msg);
    }));
    // publish example message with order uid as content
    let buffer = new Buffer('cf9418e8-eb0f-4c7e-88a3-4aca045a30f2');
    yield actor.channel.publish('orders', 'ordercreated', buffer);
    yield delay(300);
    yield actor.channel.publish('orders', 'ordercreated', buffer);
    yield delay(300);
    yield actor.channel.publish('orders', 'ordercreated', buffer);
    yield delay(300);
    yield actor.channel.publish('orders', 'ordercreated', buffer);
    yield delay(300);
    yield actor.channel.publish('orders', 'ordercreated', buffer);
    yield delay(300);
    yield actor.channel.publish('orders', 'ordercreated', buffer);
    yield delay(300);
    yield actor.channel.publish('orders', 'ordercreated', buffer);
    setTimeout(() => {
        process.exit(0);
    }, 500);
}))();
//# sourceMappingURL=exception.js.map