"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SymbolTree_1 = require("./SymbolTree");
var Alert_1 = require("./Alert");
var SemanticAnalyzer = /** @class */ (function () {
    function SemanticAnalyzer(ast) {
        this.ast = ast;
        this.st = new SymbolTree_1.SymbolTree(new SymbolTree_1.ScopeNode());
        this.log = [];
        this.warnings = [];
    }
    SemanticAnalyzer.prototype.analyze = function () {
        //Ensure current is set to root
        this.ast.current = this.ast.root;
        var err = this.analyzeNext(this.ast.root);
        //Pass the symbol tree for unused variables
        this.warnings = this.warnings.concat(this.checkForUnusedVariables(this.st.root));
        return { ast: this.ast, st: this.st, log: this.log, warnings: this.warnings, error: err };
    };
    SemanticAnalyzer.prototype.analyzeNext = function (n) {
        var err = null;
        switch (n.name) {
            case "Block": {
                err = this.analyzeBlock(n);
                break;
            }
            case "VarDecl": {
                err = this.analyzeVarDecl(n);
                break;
            }
            case "Print": {
                err = this.analyzePrint(n);
                break;
            }
            case "Assignment": {
                err = this.analyzeAssignment(n);
                break;
            }
            case "While": {
                err = this.analyzeWhile(n);
                break;
            }
            case "If": {
                err = this.analyzeIf(n);
                break;
            }
            default: {
                //Should not reach here
                this.emit("Should not reach here");
            }
        }
        return err;
    };
    SemanticAnalyzer.prototype.analyzeBlock = function (n) {
        this.emit("Block");
        //Add new scope level
        var err = null;
        this.st.addBranchNode(new SymbolTree_1.ScopeNode());
        for (var i = 0; i < n.children.length; i++) {
            err = this.analyzeNext(n.children[i]);
            if (err) {
                break;
            }
        }
        this.st.moveCurrentUp();
        return err;
    };
    SemanticAnalyzer.prototype.analyzeVarDecl = function (n) {
        this.emit("VarDecl");
        var type = n.children[0].name;
        var id = n.children[1].name;
        var success = this.st.current.addStash(id, type, 0);
        var err = null;
        if (!success) {
            this.emit("Redeclared variable");
            err = Alert_1.error("Redeclared variable: " + id + " on line " + this.st.current.stash[id].line);
        }
        return err;
    };
    SemanticAnalyzer.prototype.analyzePrint = function (n) {
        this.emit("Print");
        //Type checking will throw errors about undeclared variables within
        //any Expr
        var err = this.typeCheck(n.children[0], "");
        if (err) {
            this.emit("type mismatch");
        }
        return err;
    };
    SemanticAnalyzer.prototype.analyzeAssignment = function (n) {
        this.emit("Assignment");
        var id = n.children[0].name;
        var found = this.st.current.stash[id];
        var err = null;
        if (found) {
            this.emit("Initialized Variable");
            this.st.current.initStashed(id);
        }
        else {
            this.emit("Undeclared variable");
            err = Alert_1.error("Undeclared variable " + id + " on line 0");
        }
        if (err) {
            return err;
        }
        var expr = n.children[1];
        err = this.typeCheck(expr, found.type);
        if (err) {
            this.emit("Type mismatch");
            return err;
        }
        else {
            this.emit("Types match");
        }
        return err;
    };
    SemanticAnalyzer.prototype.analyzeWhile = function (n) {
        this.emit("While");
        var boolExpr = n.children[0];
        var err = this.typeCheck(boolExpr, "boolean");
        if (err) {
            this.emit("type mismatch");
            return err;
        }
        this.analyzeBlock(n.children[1]);
        return err;
    };
    SemanticAnalyzer.prototype.analyzeIf = function (n) {
        this.emit("If");
        var boolExpr = n.children[0];
        var err = this.typeCheck(boolExpr, "boolean");
        if (err) {
            this.emit("type mismatch");
            return err;
        }
        this.analyzeBlock(n.children[1]);
        return err;
    };
    SemanticAnalyzer.prototype.typeCheck = function (n, type) {
        //Must be a terminal symbol
        if (n.children.length == 0) {
            //0-9: int
            //true || false: boolean
            //[a-z] length >1 : string
            //[a-z]: id of some type
            if (parseInt(n.name)) {
                //Add line numbers to nodes
                return (type == "int" ? null : this.typeMismatch(n, type, "int"));
            }
            else if (n.name == "true" || n.name == "false") {
                return (type == "boolean" ? null : this.typeMismatch(n, type, "boolean"));
            }
            else if (n.name.length > 1) {
                return (type == "string" ? null : this.typeMismatch(n, type, "string"));
            }
            else {
                //Must be id
                var idType = this.typeOf(n.name);
                if (idType) {
                    return (type == idType ? null : this.typeMismatch(n, type, idType));
                }
                else {
                    this.emit("Undeclared variable");
                    return Alert_1.error("Undeclared variable: " + n.name + " on line: 0");
                }
            }
        }
        else {
            //If only valid non terminals (branches) in AST 
            //are IntOp and BoolOp nodes, their children must
            //match in type completely so we no longer need
            //the original type parameter
            var err = null;
            if (n.name == "+") {
                err = this.typeCheck(n.children[0], "int");
                if (err) {
                    return err;
                }
                err = this.typeCheck(n.children[1], "int");
            }
            else {
                err = this.typeCheck(n.children[0], "boolean");
                if (err) {
                    return err;
                }
                err = this.typeCheck(n.children[1], "boolean");
            }
            return err;
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
    SemanticAnalyzer.prototype.typeMismatch = function (n, expected, actual) {
        //Add line num to nodes
        return Alert_1.error("Type mismatch on: 0 expected: " + expected + " but got: " + actual);
    };
    SemanticAnalyzer.prototype.checkForUnusedVariables = function (n) {
        var _this = this;
        var unused = [];
        var traverse = function (node) {
            unused = unused.concat(_this.checkForUnusedVariablesHelper(node));
            if (node.children.length > 0) {
                for (var i = 0; i < node.children.length; i++) {
                    traverse(node.children[i]);
                }
            }
        };
        traverse(n);
        return unused;
    };
    SemanticAnalyzer.prototype.checkForUnusedVariablesHelper = function (n) {
        var arr = [];
        //Check current scope node
        for (var id in n.stash) {
            if (!n.stash[id].used) {
                arr.push(Alert_1.warning("Unused variable: " + n.stashEntryToString(id)));
            }
        }
        return arr;
    };
    return SemanticAnalyzer;
}());
exports.SemanticAnalyzer = SemanticAnalyzer;
