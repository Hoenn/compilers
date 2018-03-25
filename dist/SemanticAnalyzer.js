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
        if (!err) {
            this.emit("Checking for unused variables");
            this.warnings = this.warnings.concat(this.checkForUnusedVariables(this.st.root));
        }
        return { ast: this.ast, st: this.st, log: this.log, warnings: this.warnings, error: err };
    };
    SemanticAnalyzer.prototype.analyzeNext = function (n) {
        var err;
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
            }
        }
        return err;
    };
    SemanticAnalyzer.prototype.analyzeBlock = function (n) {
        this.emit("Analyzing Block");
        //Add new scope level
        var err;
        this.emit("Adding new scope level to SymbolTree");
        this.st.addBranchNode(new SymbolTree_1.ScopeNode());
        for (var i = 0; i < n.children.length; i++) {
            err = this.analyzeNext(n.children[i]);
            if (err) {
                return err;
            }
        }
        this.emit("Moving current Scope up one level");
        this.st.moveCurrentUp();
    };
    SemanticAnalyzer.prototype.analyzeVarDecl = function (n) {
        this.emit("Analyzing VarDecl");
        var type = n.children[0].name;
        var id = n.children[1].name;
        var success = this.st.current.addStash(id, type, n.lineNum ? n.lineNum : -1);
        var err;
        if (!success) {
            this.emit("Found redeclared variable in same scope");
            err = Alert_1.error("Redeclared variable: " + id + " on line: " + n.lineNum);
        }
        this.emit("Adding " + id + " to current scope");
        return err;
    };
    SemanticAnalyzer.prototype.analyzePrint = function (n) {
        this.emit("Analyzing Print");
        //Type checking will throw errors about undeclared variables within
        //any Expr
        var type = this.typeOf(n.children[0], false);
        if (typeof (type) != "string") {
            return type;
        }
        var err = this.typeCheck(n.children[0], type, true);
        if (err) {
            this.emit("Found type mismatch");
        }
        return err;
    };
    SemanticAnalyzer.prototype.analyzeAssignment = function (n) {
        this.emit("Analyzing Assignment");
        var id = n.children[0].name;
        var type = this.typeOfId(n.children[0], false);
        //type: string | Alert
        if (typeof (type) == "string") {
            this.emit("Initialized Variable " + id);
            this.st.current.initStashed(id);
        }
        else {
            return type;
        }
        var expr = n.children[1];
        var err = this.typeCheck(expr, type, true);
        if (err) {
            this.emit("Found type mismatch");
            return err;
        }
        else {
            this.emit("Types match");
        }
        return err;
    };
    SemanticAnalyzer.prototype.analyzeWhile = function (n) {
        this.emit("Analyzing While");
        var boolExpr = n.children[0];
        var err = this.typeCheck(boolExpr, "boolean", true);
        if (err) {
            this.emit("Found type mismatch");
            return err;
        }
        err = this.analyzeBlock(n.children[1]);
        return err;
    };
    SemanticAnalyzer.prototype.analyzeIf = function (n) {
        this.emit("Analyzing If");
        var boolExpr = n.children[0];
        var err = this.typeCheck(boolExpr, "boolean", true);
        if (err) {
            this.emit("Found type mismatch");
            return err;
        }
        err = this.analyzeBlock(n.children[1]);
        return err;
    };
    /**
     * @param n The node containing expression to be evaluated against
     * @param expected The expected type of expression in n
     * @param used A flag to mark n as used if it is an id
     */
    SemanticAnalyzer.prototype.typeCheck = function (n, expected, used) {
        //Must be a terminal symbol
        if (n.children.length == 0) {
            //0-9: int
            //true || false: boolean
            //[a-z] length >1 : string
            //[a-z]: id of some type
            //If types do match, return undefined, if not return an error indicating
            //the expected and actual types
            var actual = this.typeOf(n, used);
            if (actual == "int") {
                return (expected == "int" ? undefined : this.typeMismatch(n, expected, "int"));
            }
            else if (actual == "boolean") {
                return (expected == "boolean" ? undefined : this.typeMismatch(n, expected, "boolean"));
            }
            else if (actual == "string") {
                return (expected == "string" ? undefined : this.typeMismatch(n, expected, "string"));
            }
            else {
                //Must be id
                var idType = this.typeOfId(n, used);
                //idType:string|Alert
                if (typeof (idType) == "string") {
                    this.warnIfNotInitialized(n);
                    return (expected == idType ? undefined : this.typeMismatch(n, expected, idType));
                }
                else {
                    this.emit("Found undeclared variable");
                    return Alert_1.error("Undeclared variable: " + n.name + " on line: " + n.lineNum);
                }
            }
        }
        else {
            //If only valid non terminals (branches) in AST 
            //are IntOp and BoolOp nodes, their children must
            //match in type completely so we no longer need
            //the original type parameter
            var err = void 0;
            if (n.name == "+") {
                err = this.typeCheck(n.children[0], "int", used);
                if (err) {
                    return err;
                }
                err = this.typeCheck(n.children[1], "int", used);
            }
            else {
                var type = this.typeOf(n.children[0], used);
                if (typeof (type) != "string") {
                    return type;
                }
                err = this.typeCheck(n.children[1], type, used);
            }
            return err;
        }
    };
    SemanticAnalyzer.prototype.typeOf = function (n, used) {
        var token = n.name;
        if (parseInt(token) || token == "+") {
            return "int";
        }
        else if (token == "true" || token == "false") {
            return "boolean";
        }
        else if (token == "==" || token == "!=") {
            var t1 = this.typeOf(n.children[0], used);
            var t2 = this.typeOf(n.children[1], used);
            if (t1 != t2) {
                if (typeof (t1) == "string" && typeof (t2) == "string") {
                    return this.typeMismatch(n, t1, t2);
                }
            }
            return "boolean";
        }
        else if (token.length > 1) {
            return "string";
        }
        else {
            return this.typeOfId(n, used);
        }
    };
    SemanticAnalyzer.prototype.typeOfId = function (n, used) {
        var id = n.name;
        var current = this.st.current;
        while (current != null) {
            if (current.stash[id]) {
                //If checking the type of some variable, it must
                //be in a context that indicates it's being used
                if (used) {
                    current.usedStashed(id);
                    this.warnIfNotInitialized(n);
                }
                return current.stash[id].type;
            }
            current = current.parent;
        }
        //If we dont find the variable up the SymbolTree
        //Undeclared variable error
        return Alert_1.error("Undeclared variable: " + n.name + " on line: " + n.lineNum);
    };
    SemanticAnalyzer.prototype.analyzeExpr = function (n) {
        //Likely not needed
    };
    SemanticAnalyzer.prototype.emit = function (s) {
        this.log.push(s);
    };
    SemanticAnalyzer.prototype.typeMismatch = function (n, expected, actual) {
        //Add line num to nodes
        return Alert_1.error("Type mismatch on line: " + n.lineNum + " expected: " + expected + " but got: " + actual);
    };
    //Adds a warning for use of uninitialized variable
    SemanticAnalyzer.prototype.warnIfNotInitialized = function (n) {
        var id = n.name;
        var current = this.st.current;
        while (current != null) {
            if (current.stash[id] && !current.stash[id].init) {
                this.warnings.push(Alert_1.warning("Use of uninitialized variable: " + n.name + " on line: " + n.lineNum));
                return;
            }
            current = current.parent;
        }
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
                if (n.stash[id].init) {
                    arr.push(Alert_1.warning("Initialized but unused variable: " + n.stashEntryToString(id)));
                }
                else {
                    arr.push(Alert_1.warning("Unused variable: " + n.stashEntryToString(id)));
                }
            }
        }
        return arr;
    };
    return SemanticAnalyzer;
}());
exports.SemanticAnalyzer = SemanticAnalyzer;
