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
                console.log('GET CONNECTION');
                this.connection = yield amqp_1.getConnection();
            }
            this.channel = yield this.connection.createChannel();
            logger_1.log.info('bunnies.amqp.channel.created');
            yield this.channel.assertExchange(this.actorParams.exchange, 'direct');
            yield this.channel.assertQueue(this.actorParams.queue);
            logger_1.log.info('bunnies.amqp.binding.created', this.toJSON());
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
    defaultConsumer(channel, msg) {
        return __awaiter(this, void 0, void 0, function* () {
            let json = this.toJSON();
            json.message = msg.content.toString();
            logger_1.log.info(json);
            yield channel.ack(msg);
        });
    }
    start(consumer) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('START');
            let channel = yield this.connectAmqp(this.actorParams.connection);
            channel.consume(this.actorParams.queue, (msg) => {
                if (consumer) {
                    consumer(channel, msg);
                }
                else {
                    this.defaultConsumer(channel, msg);
                }
            });
        });
    }
}
exports.Actor = Actor;
//# sourceMappingURL=actor.js.map