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
const moment = require("moment");
const actors = {};
const hosts = {};
const errors = {};
function actorStarted(actorStartedEvent) {
    return __awaiter(this, void 0, void 0, function* () {
        actors[actorStartedEvent.id] = actorStartedEvent;
        if (!hosts[actorStartedEvent.ip]) {
            hosts[actorStartedEvent.ip] = {};
        }
        hosts[actorStartedEvent.ip][actorStartedEvent.id] = Object.assign(actorStartedEvent, {
            last_heartbeat_at: new Date()
        });
    });
}
exports.actorStarted = actorStarted;
function actorStopped(actorStoppedEvent) {
    return __awaiter(this, void 0, void 0, function* () {
        delete actors[actorStoppedEvent.id];
        delete errors[actorStoppedEvent.id];
        if (hosts[actorStoppedEvent.ip]) {
            delete hosts[actorStoppedEvent.ip][actorStoppedEvent.id];
            if (Object.keys(hosts[actorStoppedEvent.ip]).length === 0) {
                delete hosts[actorStoppedEvent.ip];
            }
        }
    });
}
exports.actorStopped = actorStopped;
function actorError(actorErrorEvent) {
    return __awaiter(this, void 0, void 0, function* () {
        errors[actorErrorEvent.id] = actorErrorEvent;
    });
}
exports.actorError = actorError;
function actorHeartbeat(actorHeartbeatEvent) {
    return __awaiter(this, void 0, void 0, function* () {
        let actor = hosts[actorHeartbeatEvent.ip][actorHeartbeatEvent.id];
        let newActorValue = Object.assign(actor, {
            last_heartbeat_at: new Date()
        });
        hosts[actorHeartbeatEvent.ip][actorHeartbeatEvent.id] = newActorValue;
        actors[actorHeartbeatEvent.id] = newActorValue;
    });
}
exports.actorHeartbeat = actorHeartbeat;
function listHosts() {
    return __awaiter(this, void 0, void 0, function* () {
        return Object.keys(hosts).map(ip => {
            return {
                ip,
                actors: Object.values(hosts[ip])
            };
        });
    });
}
exports.listHosts = listHosts;
setInterval(() => __awaiter(this, void 0, void 0, function* () {
    let one_minute_ago = moment().subtract(1, 'minutes').unix();
    let _actors = yield listActors();
    _actors.forEach((actor) => {
        let lastHeartbeat = moment(actor.last_heartbeat_at).unix();
        if (one_minute_ago > lastHeartbeat) {
            console.log('delete stale actor', {
                actor_id: actor.id
            });
            delete actors[actor.id];
        }
    });
    let _hosts = Object.values(hosts);
    Object.values(hosts).forEach((host) => {
        Object.values(host).forEach((actor) => {
            let lastHeartbeat = moment(actor.last_heartbeat_at).unix();
            if (one_minute_ago > lastHeartbeat) {
                console.log('delete stale actor from host', {
                    host_ip: actor.host_ip,
                    actor_id: actor.id
                });
                console.log(`hosts[${actor.ip}][${actor.id}]`);
                delete hosts[actor.ip][actor.id];
            }
        });
    });
}), 15000);
function listActors() {
    return __awaiter(this, void 0, void 0, function* () {
        return Object.values(actors);
    });
}
exports.listActors = listActors;
//# sourceMappingURL=actors.js.map