"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var StaticDataTable = /** @class */ (function () {
    function StaticDataTable() {
        //Current address starts at 3 since there are two temporary variables
        this.currentAddress = 3;
        this.variables = {};
    }
    StaticDataTable.prototype.add = function (n) {
        this.currentAddress++;
        this.variables[n.name];
    };
    return StaticDataTable;
}());
exports.StaticDataTable = StaticDataTable;
