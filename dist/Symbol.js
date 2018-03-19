"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Symbol = /** @class */ (function () {
    function Symbol(id, type, scope, line) {
        this.id = id;
        this.type = type;
        this.line = line;
        this.scopeLevel = scope;
    }
    Symbol.prototype.toString = function () {
        return "[ id: " + this.id + " type: " + this.type + " scope level: " + this.scopeLevel + " line: " + this.line + "]";
    };
    return Symbol;
}());
exports.Symbol = Symbol;
