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
const events_1 = require("events");
const logger_1 = require("./logger");
const amqp_1 = require("./amqp");
class Actor extends events_1.EventEmitter {
    toJSON() {
        return {
            exchange: this.actorParams.exchange,
            routingkey: this.actorParams.routingkey,
            queue: this.actorParams.queue
        };
    }
    connectAmqp(connection) {
        return __awaiter(this, void 0, void 0, function* () {
            if (connection) {
                this.connection = connection;
            }
            else {
                this.connection = yield amqp_1.getConnection();
            }
            this.channel = yield this.connection.createChannel();
            logger_1.log.info('bunnies.amqp.channel.created');
            let exchangeExists = yield this.channel.checkExchange(this.actorParams.exchange);
            if (!exchangeExists) {
                yield this.channel.assertExchange(this.actorParams.exchange, 'topic');
            }
            yield this.channel.assertQueue(this.actorParams.queue);
            logger_1.log.info('bunnies.amqp.binding.created', this.toJSON());
            yield this.channel.bindQueue(this.actorParams.queue, this.actorParams.exchange, this.actorParams.routingkey);
            yield this.channel.prefetch(3);
            return this.channel;
        });
    }
    constructor(actorParams) {
        super();
        this.actorParams = actorParams;
        if (!actorParams.queue) {
            this.actorParams.queue = actorParams.routingkey;
        }
        if (!actorParams.routingkey) {
            this.actorParams.routingkey = actorParams.queue;
        }
    }
    static create(connectionInfo) {
        let actor = new Actor(connectionInfo);
        return actor;
    }
    defaultConsumer(channel, msg, json) {
        return __awaiter(this, void 0, void 0, function* () {
            let message = this.toJSON();
            message.message = msg.content.toString();
            logger_1.log.info(message);
        });
    }
    start(consumer) {
        return __awaiter(this, void 0, void 0, function* () {
            var json;
            let channel = yield this.connectAmqp(this.actorParams.connection);
            channel.consume(this.actorParams.queue, (msg) => __awaiter(this, void 0, void 0, function* () {
                try {
                    json = JSON.parse(msg.content.toString());
                }
                catch (error) {
                }
                if (this.schema) {
                    let result = this.schema.validate(json);
                    if (result.error) {
                        logger_1.log.error('schema.invalid', result.error);
                        return channel.ack(msg);
                    }
                }
                if (consumer) {
                    try {
                        let result = yield consumer(channel, msg, json);
                    }
                    catch (error) {
                        console.error('rabbi.exception.caught', error.message);
                        yield channel.ack(msg); // auto acknowledge
                    }
                }
                else {
                    this.defaultConsumer(channel, msg, json);
                }
            }));
        });
    }
}
exports.Actor = Actor;
//# sourceMappingURL=actor.js.map