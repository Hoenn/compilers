"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var StaticDataTable = /** @class */ (function () {
    function StaticDataTable() {
        //Current address starts at 3 since there are two temporary variables
        this.currentAddress = 3;
        this.variables = {};
    }
    StaticDataTable.prototype.add = function (n, scope) {
        var key = n.name + ":" + scope;
        this.variables[key] = { scope: 0, addr: 0 };
        this.variables[key].scope = scope;
        var addr = this.currentAddress;
        this.variables[key].addr = this.currentAddress;
        this.currentAddress++;
        return addr;
    };
    StaticDataTable.prototype.findAddr = function (id, scope) {
        return this.variables[id + ":" + scope].addr;
    };
    return StaticDataTable;
}());
exports.StaticDataTable = StaticDataTable;
