#!/usr/bin/env ts-node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const actor_1 = require("../lib/actor");
const amqp_1 = require("../lib/amqp");
const logger_1 = require("../lib/logger");
const Hapi = require("hapi");
const actors_1 = require("../lib/actors");
function start() {
    return __awaiter(this, void 0, void 0, function* () {
        let channel = yield (0, amqp_1.getChannel)();
        channel.assertExchange('rabbi', 'topic');
        let actor = actor_1.Actor.create({
            exchange: 'rabbi',
            routingkey: 'actor.started',
            queue: 'rabbi_handle_actor_started'
        })
            .start((channel, msg, json) => __awaiter(this, void 0, void 0, function* () {
            console.log('actor.started', json);
            //log.info(JSON.stringify(json));
            (0, actors_1.actorStarted)(json);
            channel.ack(msg);
        }));
        actor_1.Actor.create({
            exchange: 'rabbi',
            routingkey: 'actor.stopped',
            queue: 'rabbi_handle_actor_stopped'
        })
            .start((channel, msg, json) => __awaiter(this, void 0, void 0, function* () {
            console.log('actor.stopped', json);
            //log.info(JSON.stringify(json));
            (0, actors_1.actorStopped)(json);
            channel.ack(msg);
        }));
        actor_1.Actor.create({
            exchange: 'rabbi',
            routingkey: 'actor.error',
            queue: 'rabbi_handle_actor_error'
        })
            .start((channel, msg, json) => __awaiter(this, void 0, void 0, function* () {
            console.log('actor.error', json);
            //log.info(JSON.stringify(json));
            (0, actors_1.actorError)(json);
            channel.ack(msg);
        }));
        actor_1.Actor.create({
            exchange: 'rabbi',
            routingkey: 'actor.heartbeat',
            queue: 'rabbi_handle_actor_heartbeat'
        })
            .start((channel, msg, json) => __awaiter(this, void 0, void 0, function* () {
            console.log('actor.heartbeat', json);
            (0, actors_1.actorHeartbeat)(json);
            channel.ack(msg);
        }));
        const server = Hapi.server({
            port: process.env.YAHWEH_PORT || 5200,
            host: '0.0.0.0',
            routes: {
                cors: true
            }
        });
        yield server.register(require('hapi-auth-basic'));
        server.auth.strategy("yahweh", "basic", { validate: (req, user, pass) => {
                if (user.toLowerCase() !== 'yahweh') {
                    return {
                        isValid: false
                    };
                }
                try {
                    if (process.env.YAHWEH_PASSWORD) {
                        if (pass !== process.env.YAHWEH_PASSWORD) {
                            return {
                                isValid: false
                            };
                        }
                    }
                    return {
                        isValid: true,
                        credentials: {
                            admin: true
                        }
                    };
                }
                catch (error) {
                    logger_1.log.error(error.message);
                    return {
                        isValid: false
                    };
                }
            } });
        server.route({
            method: 'GET',
            path: '/api/dashboard',
            handler: (request, h) => __awaiter(this, void 0, void 0, function* () {
                let hosts = yield (0, actors_1.listHosts)();
                let actors = yield (0, actors_1.listActors)();
                return { hosts, actors };
            }),
            config: {
                auth: 'yahweh'
            }
        });
        yield server.start();
        console.log('Server running on %s', server.info.uri);
    });
}
start();
//# sourceMappingURL=yahweh.js.map