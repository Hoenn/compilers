"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SymbolTree_1 = require("./SymbolTree");
var SemanticAnalyzer = /** @class */ (function () {
    function SemanticAnalyzer(ast) {
        this.ast = ast;
        this.st = new SymbolTree_1.SymbolTree(new SymbolTree_1.ScopeNode());
        this.log = [];
    }
    SemanticAnalyzer.prototype.analyze = function () {
        //Ensure current is set to root
        this.ast.current = this.ast.root;
        this.analyzeNext(this.ast.root);
        //Pass the symbol tree for unused variables
        this.emit("Unused " + this.checkForUnusedVariables(this.st.root).join(","));
        return { ast: this.ast, st: this.st, log: this.log };
    };
    SemanticAnalyzer.prototype.analyzeNext = function (n) {
        if (n.children.length == 0) {
            return;
        }
        switch (n.name) {
            case "Block": {
                this.analyzeBlock(n);
                break;
            }
            case "VarDecl": {
                this.analyzeVarDecl(n);
                break;
            }
            case "Print": {
                this.analyzePrint(n);
                break;
            }
            case "Assignment": {
                this.analyzeAssignment(n);
                break;
            }
            case "While": {
                this.analyzeWhile(n);
                break;
            }
            default: return;
        }
    };
    SemanticAnalyzer.prototype.analyzeBlock = function (n) {
        this.emit("Block");
        //Add new scope level
        this.st.addBranchNode(new SymbolTree_1.ScopeNode());
        for (var i = 0; i < n.children.length; i++) {
            this.analyzeNext(n.children[i]);
        }
        this.st.moveCurrentUp();
    };
    SemanticAnalyzer.prototype.analyzeVarDecl = function (n) {
        this.emit("VarDecl");
        var type = n.children[0].name;
        var id = n.children[1].name;
        var success = this.st.current.addStash(id, type, 0);
        if (!success) {
            this.emit("Redeclared variable");
            //Warning instead;
        }
    };
    SemanticAnalyzer.prototype.analyzePrint = function (n) {
        this.emit("Print");
        //Type checking will throw errors about undeclared variables within
        //any Expr
        if (!this.typeCheck(n.children[0], "")) {
            this.emit("type mismatch");
        }
    };
    SemanticAnalyzer.prototype.analyzeAssignment = function (n) {
        var id = n.children[0].name;
        var found = this.st.current.stash[id];
        if (found) {
            this.emit("Initialized Variable");
            this.st.current.initStashed(id);
        }
        else {
            this.emit("Undeclared variable");
        }
        var expr = n.children[1];
        var success = this.typeCheck(expr, found.type);
        if (success) {
            this.emit("Types match");
        }
        else {
            this.emit("Type mismatch");
            //Error instead;
        }
    };
    SemanticAnalyzer.prototype.analyzeWhile = function (n) {
    };
    SemanticAnalyzer.prototype.typeCheck = function (n, type) {
        //Must be a terminal symbol
        if (n.children.length == 0) {
            //0-9: int
            //true || false: boolean
            //[a-z] length >1 : string
            //[a-z]: id of some type
            if (parseInt(n.name)) {
                return type == "int";
            }
            else if (n.name == "true" || n.name == "false") {
                return type == "boolean";
            }
            else if (n.name.length > 1) {
                return type == "string";
            }
            else {
                //Must be id
                var idType = this.typeOf(n.name);
                if (idType) {
                    return type == idType;
                }
                else {
                    this.emit("Undeclared variable");
                    return false;
                }
            }
        }
        else {
            //If only valid non terminals (branches) in AST 
            //are IntOp and BoolOp nodes, their children must
            //match in type completely so we no longer need
            //the original type parameter
            if (n.name == "+") {
                return this.typeCheck(n.children[0], "int") && this.typeCheck(n.children[1], "int");
            }
            else {
                return this.typeCheck(n.children[0], "boolean") && this.typeCheck(n.children[1], "boolean");
            }
        }
    };
    SemanticAnalyzer.prototype.typeOf = function (id) {
        var current = this.st.current;
        while (current != null) {
            if (current.stash[id]) {
                //If checking the type of some variable, it must
                //be in a context that indicates it's being used
                current.usedStashed(id);
                return current.stash[id].type;
            }
            current = current.parent;
        }
        //If we dont find the variable up the SymbolTree
        //Undeclared variable error
        return null;
    };
    SemanticAnalyzer.prototype.analyzeExpr = function (n) {
        //Likely not needed
    };
    SemanticAnalyzer.prototype.emit = function (s) {
        this.log.push("Analyzing " + s);
    };
    SemanticAnalyzer.prototype.checkForUnusedVariables = function (n) {
        var unused = [];
        console.log(n);
        if (n.children.length == 0) {
            return unused.concat(this.checkForUnusedVariablesHelper(n));
        }
        else {
            for (var i = 0; i < n.children.length; i++) {
                unused.concat(this.checkForUnusedVariables(n.children[i]));
            }
        }
        return unused;
    };
    SemanticAnalyzer.prototype.checkForUnusedVariablesHelper = function (n) {
        var unused = [];
        //Check current scope node
        for (var id in n.stash) {
            if (!n.stash[id].used) {
                unused.push(n.stashEntryToString(id));
            }
        }
        return unused;
    };
    return SemanticAnalyzer;
}());
exports.SemanticAnalyzer = SemanticAnalyzer;
