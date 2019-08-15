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
(() => __awaiter(this, void 0, void 0, function* () {
    // connects to AMQP_URL environment variable
    let actor = rabbi_1.Actor.create({
        exchange: 'orders',
        routingkey: 'ordercreated',
        queue: 'printorderreceipt',
        schema: rabbi_1.Joi.object().keys({
            order_id: rabbi_1.Joi.number().integer().required(),
            memo: rabbi_1.Joi.string()
        })
    });
    yield actor.start((channel, msg, json) => __awaiter(this, void 0, void 0, function* () {
        rabbi_1.log.info('print order receipt', msg.content.toString());
        yield channel.ack(msg);
        rabbi_1.log.info('message acknowledged', msg.content.toString());
        rabbi_1.log.info('json parsed', json);
        /*
        setTimeout(() => {
    
          //process.exit(0);
    
        }, 500);
        */
    }));
    // publish example message with order uid as content
    let buffer = new Buffer(JSON.stringify({
        order_id: 1324345,
        memo: '2 skinny scouts',
    }));
    yield actor.channel.publish('orders', 'ordercreated', buffer);
}))();
//# sourceMappingURL=actor_with_schema.js.map