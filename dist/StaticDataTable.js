"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var StaticDataTable = /** @class */ (function () {
    function StaticDataTable() {
        //Current address starts at 3 since there are two temporary variables
        this.currentAddress = 3;
        this.variables = {};
    }
    StaticDataTable.prototype.add = function (n) {
        var addr = this.currentAddress;
        this.variables[n.name] = this.currentAddress;
        this.currentAddress++;
        return addr;
    };
    return StaticDataTable;
}());
exports.StaticDataTable = StaticDataTable;
