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
const path = require("path");
const assert = require("assert");
const rabbi_1 = require("../lib/rabbi");
describe("Excluding actors from an actors directory", () => {
    it('--exclude should translate to options.exclude', () => __awaiter(this, void 0, void 0, function* () {
        let actors = yield rabbi_1.startActorsDirectory(path.join(__dirname, 'actors'), {
            exclude: ['test_exclude']
        });
        actors.forEach(actor => {
            assert(actor.name !== 'test_exclude');
        });
    }));
});
//# sourceMappingURL=exclude_test.js.map