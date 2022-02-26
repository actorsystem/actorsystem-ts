"use strict";
//import * as models from '../models'
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
exports.store = exports.EventStore = void 0;
class EventStore {
    constructor() {
        this.eventTable = 'RabbiEvents';
        this.isAvailable = false;
        if (process.env.RABBI_DATABASE_URL) {
            console.log('configure in constructor');
            this.configureStore(process.env.RABBI_DATABASE_URL);
        }
    }
    configureStore(url, table = this.eventTable) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('configure store', url);
            this.models = require('../models')(url);
            this.eventTable = table;
            this.isAvailable = true;
        });
    }
    storeEvent(event, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let result = yield this.models.RabbiEvent.create({ event, payload });
                return result;
            }
            catch (error) {
                console.error('rabbi.store.error', error);
            }
        });
    }
}
exports.EventStore = EventStore;
var store = new EventStore();
exports.store = store;
//# sourceMappingURL=store.js.map