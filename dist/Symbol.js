"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Symbol = /** @class */ (function () {
    function Symbol(id, type, line) {
        this.id = id;
        this.type = type;
        this.line = line;
    }
    Symbol.prototype.toString = function () {
        return "[ id: " + this.id + " type: " + this.type + " line: " + this.line + "]";
    };
    return Symbol;
}());
exports.Symbol = Symbol;
