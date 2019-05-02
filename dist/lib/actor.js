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
const events_1 = require("events");
const logger_1 = require("./logger");
class Actor extends events_1.EventEmitter {
    connectAmqp(connection) {
        return __awaiter(this, void 0, void 0, function* () {
            this.connection = connection || (yield amqplib_1.connect(process.env.AMQP_URL));
            logger_1.log.info('amqp.channel.connected');
            this.channel = yield this.connection.createChannel();
            logger_1.log.info('amqp.channel.created');
            yield this.channel.assertExchange(this.actorParams.exchange, 'direct');
            yield this.channel.assertQueue(this.actorParams.queue);
            logger_1.log.info('bind actor to amqp', this.actorParams);
            yield this.channel.bindQueue(this.actorParams.queue, this.actorParams.exchange, this.actorParams.routingkey);
            return this.channel;
        });
    }
    constructor(actorParams) {
        super();
        this.actorParams = actorParams;
    }
    static create(connectionInfo) {
        let actor = new Actor(connectionInfo);
        return actor;
    }
    start(consumer) {
        return __awaiter(this, void 0, void 0, function* () {
            let channel = yield this.connectAmqp(this.actorParams.connection);
            channel.consume(this.actorParams.queue, function (msg) {
                consumer(channel, msg);
            });
        });
    }
}
exports.Actor = Actor;
//# sourceMappingURL=actor.js.map