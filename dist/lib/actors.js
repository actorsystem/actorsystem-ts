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
const actors = {};
const hosts = {};
const errors = {};
function actorStarted(actorStartedEvent) {
    return __awaiter(this, void 0, void 0, function* () {
        actors[actorStartedEvent.id] = actorStartedEvent;
        if (!hosts[actorStartedEvent.ip]) {
            hosts[actorStartedEvent.ip] = {};
        }
        hosts[actorStartedEvent.ip][actorStartedEvent.id] = actorStartedEvent;
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
function listHosts() {
    return __awaiter(this, void 0, void 0, function* () {
        return Object.keys(hosts).map(ip => {
            return {
                ip,
                actors: hosts[ip]
            };
        });
    });
}
exports.listHosts = listHosts;
function listActors() {
    return __awaiter(this, void 0, void 0, function* () {
        return actors;
    });
}
exports.listActors = listActors;
//# sourceMappingURL=actors.js.map