"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SemanticAnalyzer = /** @class */ (function () {
    function SemanticAnalyzer(ast) {
        this.ast = ast;
    }
    SemanticAnalyzer.prototype.analyze = function () {
        /**
         * Construct the symbol tree by doing a pass on the AST
         * While doing so we can
         * Via Nodes
         * Any:
         *  Undeclared Variable
         *  Mark variables as used in the symbol tree
         * Assignment:
         *  Mark variables as initialized
         *  Type Check
         * Plus:
         *  Type Check
         * VarDecl:
         *  Redeclared Variable
         *
         *
         *
         */
        //Pass the symbol tree for unused variables
    };
    return SemanticAnalyzer;
}());
exports.SemanticAnalyzer = SemanticAnalyzer;
