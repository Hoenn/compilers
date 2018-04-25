"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var StaticDataTable = /** @class */ (function () {
    function StaticDataTable(st) {
        //Current address starts at 3 since there are two temporary variables
        this.currentAddress = 3;
        this.variables = {};
        this.st = st;
    }
    StaticDataTable.prototype.add = function (n, scope, type) {
        var key = this.getVarKey(n.name, scope);
        this.variables[key] = { scope: 0, addr: 0 };
        this.variables[key].scope = scope;
        var addr = this.currentAddress;
        this.variables[key].addr = this.currentAddress;
        this.currentAddress++;
        (type ? this.variables[key].type = type : undefined);
        return addr;
    };
    StaticDataTable.prototype.findAddr = function (id, scope) {
        return this.variables[this.getVarKey(id, scope)].addr;
    };
    StaticDataTable.prototype.getVarKey = function (id, currentScope) {
        var scope = this.st.findLatestDeclarationScopeId(id, currentScope);
        return id + ":" + scope;
    };
    StaticDataTable.prototype.getVar = function (id, scope) {
        return this.variables[this.getVarKey(id, scope)];
    };
    return StaticDataTable;
}());
exports.StaticDataTable = StaticDataTable;
