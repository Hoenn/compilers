(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isAlert(a) {
    return a.lvl !== undefined;
}
exports.isAlert = isAlert;
function error(errMsg, lineNum) {
    return { lvl: "error", msg: errMsg + (lineNum ? " on line " + lineNum : "") };
}
exports.error = error;
function warning(m) {
    return { lvl: "warning", msg: m };
}
exports.warning = warning;

},{}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Token_1 = require("./Token");
var Alert_1 = require("./Alert");
var Lexer = /** @class */ (function () {
    function Lexer() {
        this.lineNum = 1;
    }
    Lexer.prototype.lex = function (src) {
        //Break text into blobs to perform longest match on
        //filter out undefined blobs
        var tokenBlobs = src.split(Token_1.TokenRegex.Split).filter(function (defined) { return defined; });
        var tokens = [];
        var result = { t: null, e: null };
        for (var i = 0; i < tokenBlobs.length; i++) {
            var blob = tokenBlobs[i];
            //If a comment or whitespace just skip
            if (blob.match(Token_1.TokenRegex.Comment) || blob.match(Token_1.TokenRegex.WhiteSpace)) {
                //If newline is found increment lineNum but skip
                if (blob.match("\n")) {
                    this.lineNum += 1;
                }
                continue;
            }
            result = this.longestMatch(blob, this.lineNum);
            if (result.t) {
                for (var _i = 0, _a = result.t; _i < _a.length; _i++) {
                    var t = _a[_i];
                    tokens.push(t);
                }
            }
            //It's possible to have valid tokens returned along with an error
            if (result.e) {
                //Keep the lineNum for future programs (in the same file..)
                for (var j = i; j < tokenBlobs.length; j++) {
                    if (tokenBlobs[j].match("\n")) {
                        this.lineNum += 1;
                    }
                }
                break;
            }
        }
        //If we have no errors, check if EOP is missing. No need if there are other lex errors
        if (result.e === null) {
            if (tokens.length == 0 || tokens[tokens.length - 1].kind != Token_1.TokenType.EOP) {
                tokens.push(new Token_1.Token(Token_1.TokenType.EOP, "$", this.lineNum));
                result.e = Alert_1.warning("End of Program missing. Added $ symbol.");
            }
        }
        return { t: tokens, e: result.e };
    };
    Lexer.prototype.longestMatch = function (blob, lineNum) {
        if (Token_1.TokenRegex.Quote.test(blob)) {
            //Break "quoted" blob into characters after removing comments
            var noComment = blob.replace(/\/\*.*\*\//g, "");
            var splitQuote = noComment.split("");
            var tokenArray = [];
            for (var _i = 0, splitQuote_1 = splitQuote; _i < splitQuote_1.length; _i++) {
                var char = splitQuote_1[_i];
                //If it's a quote simply add that token
                if (char === "\"") {
                    tokenArray.push(new Token_1.Token(Token_1.TokenType.Quote, char, lineNum));
                }
                else if (char.match(/[a-z]/) || char.match(/\s/)) {
                    //If it's a new line, accurately report it
                    if (char.match("\n")) {
                        return { t: tokenArray, e: this.multiLineStringError(lineNum) };
                    }
                    //If it's a letter or space add that token
                    tokenArray.push(new Token_1.Token(Token_1.TokenType.Char, char, lineNum));
                }
                else {
                    //"quoted" may only contain valid lexemes (chars)
                    return { t: tokenArray, e: this.unknownTokenError(char, lineNum) };
                }
            }
            return { t: tokenArray, e: null };
        }
        else if (Token_1.TokenRegex.While.test(blob)) {
            return { t: [new Token_1.Token(Token_1.TokenType.While, blob, lineNum)], e: null };
        }
        else if (Token_1.TokenRegex.Print.test(blob)) {
            return { t: [new Token_1.Token(Token_1.TokenType.Print, blob, lineNum)], e: null };
        }
        else if (Token_1.TokenRegex.EOP.test(blob)) {
            return { t: [new Token_1.Token(Token_1.TokenType.EOP, blob, lineNum)], e: null };
        }
        else if (Token_1.TokenRegex.VarType.test(blob)) {
            return { t: [new Token_1.Token(Token_1.TokenType.VarType, blob, lineNum)], e: null };
        }
        else if (Token_1.TokenRegex.If.test(blob)) {
            return { t: [new Token_1.Token(Token_1.TokenType.If, blob, lineNum)], e: null };
        }
        else if (Token_1.TokenRegex.BoolLiteral.test(blob)) {
            return { t: [new Token_1.Token(Token_1.TokenType.BoolLiteral, blob, lineNum)], e: null };
        }
        else if (Token_1.TokenRegex.Id.test(blob)) {
            return { t: [new Token_1.Token(Token_1.TokenType.Id, blob, lineNum)], e: null };
        }
        else if (Token_1.TokenRegex.Digit.test(blob)) {
            return { t: [new Token_1.Token(Token_1.TokenType.Digit, blob, lineNum)], e: null };
        }
        else if (Token_1.TokenRegex.Assign.test(blob)) {
            return { t: [new Token_1.Token(Token_1.TokenType.Assign, blob, lineNum)], e: null };
        }
        else if (Token_1.TokenRegex.IntOp.test(blob)) {
            return { t: [new Token_1.Token(Token_1.TokenType.IntOp, blob, lineNum)], e: null };
        }
        else if (Token_1.TokenRegex.BoolOp.test(blob)) {
            return { t: [new Token_1.Token(Token_1.TokenType.BoolOp, blob, lineNum)], e: null };
        }
        else if (Token_1.TokenRegex.LParen.test(blob)) {
            return { t: [new Token_1.Token(Token_1.TokenType.LParen, blob, lineNum)], e: null };
        }
        else if (Token_1.TokenRegex.RParen.test(blob)) {
            return { t: [new Token_1.Token(Token_1.TokenType.RParen, blob, lineNum)], e: null };
        }
        else if (Token_1.TokenRegex.LBracket.test(blob)) {
            return { t: [new Token_1.Token(Token_1.TokenType.LBracket, blob, lineNum)], e: null };
        }
        else if (Token_1.TokenRegex.RBracket.test(blob)) {
            return { t: [new Token_1.Token(Token_1.TokenType.RBracket, blob, lineNum)], e: null };
        }
        else {
            //Blob did not match any valid tokens, but may contain valid tokens
            //ex: intx -> [int, x]
            //Check match for keywords
            if (blob.match(Token_1.TokenRegex.Keywords)) {
                //If there are keywords, split string by them and longest match the result
                var splitBlob = blob.split(Token_1.TokenRegex.Keywords)
                    .filter(function (def) { return def; });
                var tokenArray = [];
                var result = { t: null, e: null };
                for (var _a = 0, splitBlob_1 = splitBlob; _a < splitBlob_1.length; _a++) {
                    var b = splitBlob_1[_a];
                    //Longest match on new string
                    var result_1 = this.longestMatch(b, lineNum);
                    //If there is no error, keep this token and proceed
                    if (result_1.t) {
                        for (var _b = 0, _c = result_1.t; _b < _c.length; _b++) {
                            var t = _c[_b];
                            tokenArray.push(t);
                        }
                    }
                    else {
                        break;
                    }
                }
                return { t: tokenArray, e: result.e };
            }
            else {
                //If the blob doesn't contain any keywords and reached here it must not be valid
                return { t: null, e: this.unknownTokenError(blob, lineNum) };
            }
        }
    };
    Lexer.prototype.unknownTokenError = function (blob, lineNum) {
        return Alert_1.error("Unknown token " + blob.trim(), lineNum);
    };
    Lexer.prototype.multiLineStringError = function (lineNum) {
        return Alert_1.error("Multiline strings not allowed, found", lineNum);
    };
    return Lexer;
}());
exports.Lexer = Lexer;

},{"./Alert":1,"./Token":8}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Token_1 = require("./Token");
var SyntaxTree_1 = require("./SyntaxTree");
var Alert_1 = require("./Alert");
var Symbol_1 = require("./Symbol");
var Parser = /** @class */ (function () {
    function Parser(tokens) {
        //Add initial program token, make root node
        this.cst = new SyntaxTree_1.SyntaxTree(new SyntaxTree_1.Node("Root"));
        this.ast = new SyntaxTree_1.SyntaxTree(new SyntaxTree_1.Node("Root", -1));
        this.tokens = tokens;
        this.log = [];
        this.symbolTable = [];
        this.currentString = "";
    }
    Parser.prototype.parse = function () {
        var err = this.parseProgram();
        if (err) {
            return { log: this.log, cst: null, ast: null, st: null, e: err };
        }
        //If there are more tokens
        if (this.tokens.length > 0) {
            //If there is a left bracket, parse the next program
            // LBracket is the only valid token after EOP
            if (this.tokens[0].kind == Token_1.TokenType.LBracket) {
                return this.parse();
            }
            else {
                err = Alert_1.error("Unexpected token '" + this.tokens[0].value + "' after EOP");
            }
        }
        if (err) {
            return { log: this.log, cst: null, ast: null, st: null, e: err };
        }
        this.ast.clean();
        return { log: this.log, cst: this.cst, ast: this.ast, st: this.symbolTable, e: undefined };
    };
    Parser.prototype.parseProgram = function () {
        this.emit("program");
        this.addBranch("Program");
        var err = this.parseBlock();
        if (err) {
            return err;
        }
        err = this.consume(["[$]"], Token_1.TokenType.EOP);
        if (err) {
            return err;
        }
        this.moveUp();
        this.cst.moveCurrentUp();
    };
    Parser.prototype.parseBlock = function () {
        this.emit("block");
        this.addBranch("Block");
        this.addASTBranch("Block", this.tokens[0].lineNum);
        var error = this.consume(["{"], Token_1.TokenType.LBracket);
        if (error) {
            return error;
        }
        error = this.parseStatementList();
        if (error) {
            return error;
        }
        error = this.consume(["}"], Token_1.TokenType.RBracket);
        if (error) {
            return error;
        }
        this.cst.moveCurrentUp();
        this.ast.moveCurrentUp();
    };
    Parser.prototype.parseStatementList = function () {
        this.addBranch("StatementList");
        var nToken = this.tokens[0].value;
        if (nToken.match(Token_1.TokenRegex.Statement)) {
            var err = this.parseStatement();
            if (err) {
                return err;
            }
        }
        else {
            //Lambda Production
            this.emit("Lambda Production in StatementList on line " + this.tokens[0].lineNum);
        }
        //Incase tokens may have moved in parseStatement above, reassign nToken
        nToken = this.tokens[0].value;
        //See if next token would start a valid statement
        //If so, recurse, if not moveUp
        if (nToken.match(Token_1.TokenRegex.Statement)) {
            var err = this.parseStatementList();
            if (err) {
                return err;
            }
        }
        this.cst.moveCurrentUp();
    };
    Parser.prototype.parseStatement = function () {
        this.emit("statement");
        this.addBranch("Statement");
        //Look at next token to decide how to parse
        var nToken = this.tokens[0].kind;
        var err;
        switch (nToken) {
            case Token_1.TokenType.LBracket: {
                err = this.parseBlock();
                break;
            }
            case Token_1.TokenType.Print: {
                err = this.parsePrint();
                break;
            }
            case Token_1.TokenType.VarType: {
                err = this.parseVarDecl();
                break;
            }
            case Token_1.TokenType.While: {
                err = this.parseWhile();
                break;
            }
            case Token_1.TokenType.If: {
                err = this.parseIf();
                break;
            }
            case Token_1.TokenType.Id: {
                err = this.parseAssignment();
                break;
            }
            default: {
                err = Alert_1.error("Expected print|while|Assignment|VarDecl|If|Block statement on ", this.tokens[0].lineNum);
                break;
            }
        }
        //Propagate any errs from switch
        if (err) {
            return err;
        }
        this.cst.moveCurrentUp();
    };
    Parser.prototype.parsePrint = function () {
        this.emit("print statement");
        this.addBranch("PrintStatement");
        this.addASTBranch("Print", this.tokens[0].lineNum);
        var err = this.consume(["print"], "print");
        if (err) {
            return err;
        }
        //"[(]" since ( alone throws malformed RegExp error
        // /\(/ also accomplishes the same
        this.consume(["[(]"], "(");
        err = this.parseExpr();
        if (err) {
            return err;
        }
        err = this.consume(["[)]"], ")");
        if (err) {
            return err;
        }
        this.cst.moveCurrentUp();
        this.ast.moveCurrentUp();
    };
    Parser.prototype.parseAssignment = function () {
        this.emit("assignment statement");
        this.addBranch("AssignmentStatement");
        this.addASTBranch("Assignment", this.tokens[0].lineNum);
        var err = this.parseId();
        if (err) {
            return err;
        }
        err = this.consume([Token_1.TokenRegex.Assign], "Equals");
        if (err) {
            return err;
        }
        err = this.parseExpr();
        if (err) {
            return err;
        }
        this.cst.moveCurrentUp();
        this.ast.moveCurrentUp();
    };
    Parser.prototype.parseIf = function () {
        this.emit("if statement");
        this.addBranch("IfStatement");
        this.addASTBranch("If", this.tokens[0].lineNum);
        var err = this.consume([Token_1.TokenRegex.If], "if");
        if (err) {
            return err;
        }
        err = this.parseBoolExpr();
        if (err) {
            return err;
        }
        err = this.parseBlock();
        if (err) {
            return err;
        }
        this.cst.moveCurrentUp();
        this.ast.moveCurrentUp();
    };
    Parser.prototype.parseWhile = function () {
        this.emit("while statement");
        this.addBranch("WhileStatement");
        this.addASTBranch("While", this.tokens[0].lineNum);
        var err = this.consume(["while"], "while");
        if (err) {
            return err;
        }
        err = this.parseBoolExpr();
        if (err) {
            return err;
        }
        err = this.parseBlock();
        if (err) {
            return err;
        }
        this.cst.moveCurrentUp();
        this.ast.moveCurrentUp();
    };
    Parser.prototype.parseVarDecl = function () {
        this.emit("variable declaration");
        this.addBranch("VarDeclStatement");
        this.addASTBranch("VarDecl", this.tokens[0].lineNum);
        var type = this.tokens[0].value;
        var err = this.parseType();
        if (err) {
            return err;
        }
        var id = this.tokens[0].value;
        var line = this.tokens[0].lineNum;
        err = this.parseId();
        if (err) {
            return err;
        }
        this.log.push("Adding " + type + " " + id + " to Symbol Table");
        this.symbolTable.push(new Symbol_1.Symbol(id, type, line));
        this.cst.moveCurrentUp();
        this.ast.moveCurrentUp();
    };
    Parser.prototype.parseExpr = function () {
        this.emit("expression");
        this.addBranch("Expression");
        var nToken = this.tokens[0].kind;
        var err;
        switch (nToken) {
            case Token_1.TokenType.Digit: {
                err = this.parseIntExpr();
                break;
            }
            case Token_1.TokenType.Id: {
                err = this.parseId();
                break;
            }
            case Token_1.TokenType.LParen: {
                err = this.parseBoolExpr();
                break;
            }
            case Token_1.TokenType.BoolLiteral: {
                err = this.parseBoolExpr();
                break;
            }
            case Token_1.TokenType.Quote: {
                err = this.parseStringExpr();
                break;
            }
            default: {
                return Alert_1.error("Expected Int|Boolean|String expression or Id got " +
                    this.tokens[0].kind, this.tokens[0].lineNum);
            }
        }
        if (err) {
            return err;
        }
        this.cst.moveCurrentUp();
    };
    Parser.prototype.parseIntExpr = function () {
        this.emit("int expression");
        this.addBranch("IntExpr");
        //If this is an addition expression, add the plus
        //node so that Digit terminals will be children
        if (this.tokens[1].kind == Token_1.TokenType.IntOp) {
            this.addASTBranch("Plus", this.tokens[0].lineNum);
        }
        var err = this.consume([Token_1.TokenRegex.Digit], "Digit", true);
        if (err) {
            return err;
        }
        var nToken = this.tokens[0].kind;
        if (nToken == Token_1.TokenType.IntOp) {
            err = this.consume([Token_1.TokenRegex.IntOp], "Plus");
            if (err) {
                return err;
            }
            err = this.parseExpr();
            if (err) {
                return err;
            }
            this.ast.moveCurrentUp();
        }
        this.cst.moveCurrentUp();
    };
    Parser.prototype.parseBoolExpr = function () {
        this.emit("boolean expression");
        this.addBranch("BooleanExpr");
        var err;
        var nToken = this.tokens[0];
        if (nToken.kind == Token_1.TokenType.LParen) {
            //Replace the name of this node once it has been evaluated
            this.addASTBranch("?", nToken.lineNum);
            var boolOpNode = this.ast.current;
            err = this.consume(["[(]"], Token_1.TokenType.LParen);
            if (err) {
                return err;
            }
            err = this.parseExpr();
            if (err) {
                return err;
            }
            if (this.tokens[0].value == "==") {
                boolOpNode.name = "EqualTo";
            }
            else {
                boolOpNode.name = "NotEqualTo";
            }
            err = this.consume([Token_1.TokenRegex.BoolOp], "boolean operation");
            if (err) {
                return err;
            }
            err = this.parseExpr();
            if (err) {
                return err;
            }
            err = this.consume(["[)]"], Token_1.TokenType.RParen);
            if (err) {
                return err;
            }
            this.ast.moveCurrentUp();
        }
        else if (nToken.kind == Token_1.TokenType.BoolLiteral) {
            err = this.consume([Token_1.TokenRegex.BoolLiteral], "boolean literal", true);
            if (err) {
                return err;
            }
        }
        else {
            return Alert_1.error("Expected BooleanExpression got " + nToken.kind + " on line " + nToken.lineNum);
        }
        this.cst.moveCurrentUp();
    };
    Parser.prototype.parseStringExpr = function () {
        this.currentString = "";
        this.addBranch("StringExpr");
        this.emit("string expression");
        var lineNum = this.tokens[0].lineNum;
        var err = this.consume(['"'], "open quote");
        if (err) {
            return err;
        }
        err = this.parseCharList();
        if (err) {
            return err;
        }
        err = this.consume(['"'], "close quote");
        if (err) {
            return err;
        }
        this.ast.addLeafNode(new SyntaxTree_1.Node(this.currentString, lineNum, true));
        this.cst.moveCurrentUp();
    };
    Parser.prototype.parseCharList = function () {
        this.addBranch("CharList");
        this.emit("character list");
        var nToken = this.tokens[0];
        var err;
        //Check for character
        if (nToken.value.match(Token_1.TokenRegex.Char)) {
            this.currentString += nToken.value;
            err = this.consume([Token_1.TokenRegex.Char], "lower case character");
        }
        else if (nToken.value == ' ') {
            this.currentString += nToken.value;
            err = this.consume([" "], "space");
        }
        else {
            //Lambda production for empty charlist"
        }
        //If next token is a char, repeat
        if (nToken.value.match(/[a-z]|( )/)) {
            err = this.parseCharList();
            if (err) {
                return err;
            }
        }
        this.cst.moveCurrentUp();
        return err;
    };
    Parser.prototype.parseId = function () {
        this.addBranch("Id");
        this.emit("id");
        var err = this.consume([Token_1.TokenRegex.Id], "Id", true);
        if (err) {
            return err;
        }
        this.cst.moveCurrentUp();
    };
    Parser.prototype.parseType = function () {
        this.addBranch("Type");
        this.emit("type");
        var err = this.consume([Token_1.TokenRegex.Type], "int|boolean|string type", true);
        if (err) {
            return err;
        }
        this.cst.moveCurrentUp();
    };
    //search[] may contain string | RegExp
    //want:string is needed for error reporting in case a list of
    //  possible input is being searched for
    Parser.prototype.consume = function (search, want, ast) {
        var cToken = this.tokens.shift();
        if (cToken) {
            for (var _i = 0, search_1 = search; _i < search_1.length; _i++) {
                var exp = search_1[_i];
                if (cToken.value.match(exp)) {
                    if (ast) {
                        this.ast.addLeafNode(new SyntaxTree_1.Node(cToken.value, cToken.lineNum));
                    }
                    this.cst.addLeafNode(new SyntaxTree_1.Node(cToken.value));
                    return undefined;
                }
            }
        }
        else {
            //Should never happen if Lex was passed
            return Alert_1.error("Unexpected end of input");
        }
        return Alert_1.error("Expected " + want + " got " + cToken.kind, cToken.lineNum);
    };
    Parser.prototype.emit = function (s) {
        this.log.push("Parsing " + s);
    };
    Parser.prototype.addBranch = function (nodeName) {
        this.cst.addBranchNode(new SyntaxTree_1.Node(nodeName));
    };
    Parser.prototype.addASTBranch = function (nodeName, lineNum) {
        this.ast.addBranchNode(new SyntaxTree_1.Node(nodeName, lineNum));
    };
    Parser.prototype.moveUp = function () {
        this.cst.moveCurrentUp();
    };
    return Parser;
}());
exports.Parser = Parser;

},{"./Alert":1,"./Symbol":5,"./SyntaxTree":7,"./Token":8}],4:[function(require,module,exports){
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
        this.st.clean();
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
        if (Alert_1.isAlert(type)) {
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
        if (Alert_1.isAlert(type)) {
            return type;
        }
        this.emit("Initialized Variable " + id);
        this.initVariable(id);
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
                if (Alert_1.isAlert(idType)) {
                    this.emit("Found undeclared variable");
                    return Alert_1.error("Undeclared variable: " + n.name + " on line: " + n.lineNum);
                }
                this.warnIfNotInitialized(n);
                return (expected == idType ? undefined : this.typeMismatch(n, expected, idType));
            }
        }
        else {
            //If only valid non terminals (branches) in AST 
            //are IntOp and BoolOp nodes, their children must
            //match in type completely so we no longer need
            //the original type parameter
            var err = void 0;
            if (n.name == "Plus") {
                err = this.typeCheck(n.children[0], "int", used);
                if (err) {
                    return err;
                }
                err = this.typeCheck(n.children[1], "int", used);
            }
            else {
                var type = this.typeOf(n.children[0], used);
                //There was an error
                if (Alert_1.isAlert(type)) {
                    return type;
                }
                var type2 = this.typeOf(n.children[1], used);
                if (Alert_1.isAlert(type2)) {
                    return type2;
                }
                if (type != type2) {
                    return this.typeMismatch(n, type, type2);
                }
                err = this.typeCheck(n.children[1], type, used);
            }
            return err;
        }
    };
    SemanticAnalyzer.prototype.typeOf = function (n, used) {
        var token = n.name;
        if (n.isString) {
            return "string";
        }
        else if (!isNaN(parseInt(token)) || token == "Plus") {
            return "int";
        }
        else if (token == "true" || token == "false") {
            return "boolean";
        }
        else if (token == "EqualTo" || token == "NotEqualTo") {
            var t1 = this.typeOf(n.children[0], used);
            if (Alert_1.isAlert(t1)) {
                return t1;
            }
            var t2 = this.typeOf(n.children[1], used);
            if (Alert_1.isAlert(t2)) {
                return t2;
            }
            if (t1 != t2) {
                return this.typeMismatch(n, t1, t2);
            }
            return "boolean";
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
    SemanticAnalyzer.prototype.initVariable = function (id) {
        var current = this.st.current;
        while (current != null) {
            if (current.stash[id]) {
                current.stash[id].init = true;
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

},{"./Alert":1,"./SymbolTree":6}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SymbolTree = /** @class */ (function () {
    function SymbolTree(n) {
        this.root = n;
        this.current = this.root;
        //Reset global node count on construction
        count = 0;
    }
    SymbolTree.prototype.addBranchNode = function (n) {
        //Maybe refactor to construct a node here
        //Set the parent of new Node
        n.parent = this.current;
        //Add new node to current child list
        this.current.addChild(n);
        //Update current to new node
        this.current = n;
    };
    SymbolTree.prototype.addLeafNode = function (n) {
        n.parent = this.current;
        this.current.addChild(n);
    };
    SymbolTree.prototype.moveCurrentUp = function () {
        //If it has a parent move it up
        if (this.current.parent) {
            this.current = this.current.parent;
        }
    };
    SymbolTree.prototype.toString = function () {
        var result = "";
        function expand(node, depth) {
            for (var i = 0; i < depth; i++) {
                result += " ";
            }
            result += "+\n";
            for (var id in node.stash) {
                //Indent in
                for (var i = 0; i < depth; i++) {
                    result += " ";
                }
                result += "| ";
                var v = node.stash[id];
                result += id + " type: " + v.type + " line: " + v.line + " init: " + v.init + " used: " + v.used + " scopeId: " + v.scopeId + "\n";
            }
            if (node.children.length !== 0) {
                for (var i = 0; i < node.children.length; i++) {
                    expand(node.children[i], depth + 1);
                }
            }
        }
        expand(this.root, 0);
        return result;
    };
    SymbolTree.prototype.clean = function () {
        this.root = this.root.children[0];
    };
    SymbolTree.prototype.findLatestDeclarationScopeId = function (id, scopeId) {
        function find(searchScope) {
            if (searchScope.stash[id]) {
                return searchScope.scopeId;
            }
            else {
                if (searchScope.parent)
                    return find(searchScope.parent);
                else
                    return -1;
            }
        }
        var currentScopeNode = this.getScopeByScopeId(scopeId);
        if (currentScopeNode)
            return find(currentScopeNode);
        else
            return -1;
    };
    SymbolTree.prototype.getScopeByScopeId = function (scopeId) {
        var found = undefined;
        function find(node, searchScopeId) {
            if (node.scopeId == searchScopeId) {
                found = node;
            }
            else {
                for (var i = 0; i < node.children.length; i++) {
                    find(node.children[i], searchScopeId);
                }
            }
        }
        find(this.root, scopeId);
        return found;
    };
    return SymbolTree;
}());
exports.SymbolTree = SymbolTree;
var count = 0;
var ScopeNode = /** @class */ (function () {
    function ScopeNode() {
        this.stash = {};
        this.children = [];
        this.parent = null;
        this.scopeId = count++;
    }
    ScopeNode.prototype.addChild = function (n) {
        this.children.push(n);
    };
    ScopeNode.prototype.addStash = function (id, t, l) {
        if (this.stash[id]) {
            //Collision
            return false;
        }
        else {
            this.stash[id] = { "type": t, "line": l, "init": false, "used": false, "scopeId": this.scopeId };
            return true;
        }
    };
    ScopeNode.prototype.stashEntryToString = function (id) {
        var entry = this.stash[id];
        if (!entry)
            return "";
        return entry.type + " " + id + " on line: " + entry.line;
    };
    ScopeNode.prototype.initStashed = function (id) {
        var entry = this.stash[id];
        if (!entry)
            return false;
        entry.init = true;
        return true;
    };
    ScopeNode.prototype.usedStashed = function (id) {
        var entry = this.stash[id];
        if (!entry)
            return false;
        entry.used = true;
        return true;
    };
    return ScopeNode;
}());
exports.ScopeNode = ScopeNode;

},{}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SyntaxTree = /** @class */ (function () {
    function SyntaxTree(n) {
        this.root = n;
        this.current = this.root;
    }
    SyntaxTree.prototype.addBranchNode = function (n) {
        //Maybe refactor to construct a node here
        //Set the parent of new Node
        n.parent = this.current;
        //Add new node to current child list
        this.current.addChild(n);
        //Update current to new node
        this.current = n;
    };
    SyntaxTree.prototype.addLeafNode = function (n) {
        n.parent = this.current;
        this.current.addChild(n);
    };
    SyntaxTree.prototype.moveCurrentUp = function () {
        //If it has a parent move it up
        if (this.current.parent) {
            this.current = this.current.parent;
        }
    };
    SyntaxTree.prototype.toString = function () {
        var result = "";
        function expand(node, depth) {
            //Add indentation
            for (var i = 0; i < depth; i++) {
                result += "-";
            }
            if (node.children.length === 0) {
                result += "[" + node.name + "]";
                result += "\n";
            }
            else {
                result += "<" + node.name + ">\n";
                for (var i = 0; i < node.children.length; i++) {
                    expand(node.children[i], depth + 1);
                }
            }
        }
        expand(this.root, 0);
        return result;
    };
    SyntaxTree.prototype.clean = function () {
        this.root = this.root.children[0];
    };
    return SyntaxTree;
}());
exports.SyntaxTree = SyntaxTree;
var Node = /** @class */ (function () {
    function Node(n, line, isString) {
        this.name = n;
        this.parent = null;
        this.children = [];
        (line ? this.lineNum = line : undefined);
        (isString ? this.isString = isString : undefined);
    }
    Node.prototype.addChild = function (n) {
        this.children.push(n);
    };
    return Node;
}());
exports.Node = Node;

},{}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Token = /** @class */ (function () {
    function Token(kind, value, lineNum) {
        this.kind = kind;
        this.value = value;
        this.lineNum = lineNum;
    }
    return Token;
}());
exports.Token = Token;
//Master list of available token types
var TokenType;
(function (TokenType) {
    TokenType["EOP"] = "EOP";
    TokenType["While"] = "While";
    TokenType["If"] = "If";
    TokenType["Print"] = "Print";
    TokenType["VarType"] = "VarType";
    TokenType["BoolLiteral"] = "BoolLiteral";
    TokenType["Id"] = "Id";
    TokenType["Char"] = "Char";
    TokenType["Digit"] = "Digit";
    TokenType["LParen"] = "LParen";
    TokenType["RParen"] = "RParen";
    TokenType["Quote"] = "Quote";
    TokenType["LBracket"] = "LBracket";
    TokenType["RBracket"] = "RBracket";
    TokenType["Assign"] = "Assign";
    TokenType["BoolOp"] = "BoolOp";
    TokenType["IntOp"] = "IntOp";
})(TokenType = exports.TokenType || (exports.TokenType = {}));
//Used  to calculate starting colNum of a token
//Not used right now, leaving just in case
exports.TokenGlyphs = {
    "EOP": "$",
    "While": "while",
    "If": "if",
    "Print": "print",
    "Id": ""
};
exports.TokenRegex = {
    //Break on characters -> digits -> "any/*text*/" -> /*comments*/ -> symbols and new lines
    Split: new RegExp(/([a-z]+)|([0-9])|("[^"]*")|(\/\*.*\*\/)|(==|!=|=|\$|{|}|\(|\)|\+|\s)/g),
    WhiteSpace: new RegExp(/^(\s)$/g),
    //types, while, print, id (for assignment), block start,
    Statement: new RegExp(/(int|boolean|string|[a-z]|{|if|while)/g),
    //Match any keyword first, then valid ids after
    Keywords: new RegExp(/(int|boolean|string|while|print|if|true|false|[a-z])/g),
    Comment: new RegExp(/^\/\*.*\*\/$/),
    EOP: new RegExp(/(^|\s)[$]($|\s)/),
    While: new RegExp(/(^|\s)while($|\s)/),
    If: new RegExp(/(^|\s)if($|\s)/),
    Print: new RegExp(/(^|\s)print($|\s)/),
    VarType: new RegExp(/(^|\s)(int|boolean|string)($|\s)/g),
    BoolLiteral: new RegExp(/(^|\s)(true|false)($|\s)/),
    Id: new RegExp(/^[a-z]$/),
    Quote: new RegExp(/(".*)/g),
    Char: new RegExp(/[a-z]/),
    Digit: new RegExp(/[0-9]/),
    LParen: new RegExp(/(\()/),
    RParen: new RegExp(/(\))/),
    LBracket: new RegExp(/({)/),
    RBracket: new RegExp(/(})/),
    Assign: new RegExp(/^(=)$/),
    BoolOp: new RegExp(/(==)|(!=)/),
    IntOp: new RegExp(/(\+)/)
};

},{}],9:[function(require,module,exports){
const programs = [
{
    "name": "Example",
    "source": 
`/*Full Grammar*/
{
    int x
    x =0
    int y
    y= 6 

    while(x != y) {
        print(x)
        x = 1 + x
        if(x == 3) {
            print("fizz")
        }
        if (x==5) {
            print("buzz")
        }

    }
}$
`,
    "type":null
},
{
    "name": "EOP Warning",
    "source":
`/*Missing EOP Warning*/
{
    int x
}
`,
    "type": "warning"
},
{
    "name": "Invalid Token",
    "source": 
`/*Invalid Token Error*/
{
    int y
    y = 3
    print(y * 2)
} $
`,
    "type": "error"
},
{
    "name":"Multiple Programs",
    "source":
`/*Multiple Programs*/
{
    int x
} $ {
    int y
} $
`,
    "type": null
},
{
    "name":"Lex Edge Cases",
    "source":
`/*Lex Edge Cases*/
"a /*b*/ c"
"int x"
int intel
intintel
"ab
`,
    "type": "warning"
},
{
    "name": "Many Lex Examples",
    "source":
`
/*Should pass the lexer with no warnings or errors*/
{1=2}$
{}$
{{{}}}$
{{{}}$
{print("")}$
{print(a)}$
{print(2)}$
{print("a")}$
{print(false)}$
{print("inta")}$
print(a){print(a)}$
{a=1}$
{a = 1}$
{a = 1 + 2 + 3 + 4    +   5}$
{
    int a
    a=a
    string b
    a=b
}$
{int a a=a string b a=b}$
{{a=1+2+3+4+5{print(4+a)}}}$
{
    /*comment*/
    string b
}$
{
    string s
    s="this string is /* in */ visible"
}$


`,
    "type": "null"

},
{
    "name": "Ugly code will Lex",
    "source":
`{intii=0stringss="hello"booleanbb=(true==(1!=2))if(b==true){while(true!=(b!=(false==(2!=3)))){i=1+iprint(s)}}print("ugly code")}$`,
    "type": "null"
},

{
    "name":"Fast Inverse Square Root",
    "source":
`/*Fast Inverse Square Root*/
float Q_rsqrt( float number )
{
	long i;
	float x2, y;
	const float threehalfs = 1.5F;

	x2 = number * 0.5F;
	y  = number;
	i  = * ( long * ) &y;                       // evil floating point bit level hacking
	i  = 0x5f3759df - ( i >> 1 );               // what the f***? 
	y  = * ( float * ) &i;
	y  = y * ( threehalfs - ( x2 * y * y ) );   // 1st iteration
//	y  = y * ( threehalfs - ( x2 * y * y ) );   // 2nd iteration, this can be removed

    return y;
`,
    "type":"error"
}
];
module.exports = {
    programs: programs
}

},{}],10:[function(require,module,exports){
var example  = require('./examples');
const programs = example.programs;
const LexerModule = require('../dist/Lexer.js');
const ParserModule = require('../dist/Parser.js');
const SemanticAnalysisModule = require('../dist/SemanticAnalyzer.js');
var editor;
window.onload = function() {
    setupAceEditor();
    setupMemoryGauge();
    setupProgramList();

    //Compile Code
    window.compileCode = this.compileCode;
}
compileCode = function() {
    //Don't run if editor is empty
    if(editor.getValue().trim() == ""){
        return;
    } 
    clearTabsAndErrors();
    
    //Pre group programs by EOP ($)
    var pgms = preGroup(editor.getValue());

    //Lexer
    $("#log-text").html("Starting Lexer...\n");
    //Safe way to track time, supported on newer browsers
    let start =  window.performance.now();

    let lexedPgms = lexPgms(pgms);
    //lexedPrograms :: [{t:Token[], e:{lvl:string, msg:string} | null} | null]
    for(let i = 0; i < lexedPgms.length; i++) {
        //Program number text
        $("#lexer-text").append("<i>Program "+(i+1)+"\n</i>");
        //Check for errors
        let result = lexedPgms[i];
        if (result.t){
            let tokens = result.t;
            for(let k = 0; k < tokens.length; k++) {
                let text = "[LEXER] => "+tokens[k].kind+" ["+tokens[k].value+
                           "] on line: "+tokens[k].lineNum+"\n";
                tabOutput("lexer",text);
            }
        }
        if(result.e) {
            let errorMsg = errorSpan("LEXER", result.e);
            logError('lexer', errorMsg);
            $("#tab-head-two").addClass(statusColor(result.e.lvl));
        } 
        $("#lexer-text").append("\n");
    }
   
    
 
    let time = window.performance.now()-start;
    logOutput("lexer", "[LEXER] => Completed in: "+time.toFixed(2)+" ms\n");

    //Parser
    $("#log-text").append("\nStarting Parser...\n");
    //Safe way to track time, supported on newer browsers
    start =  window.performance.now();
    let parsedPgms = []
    for(let i = 0; i < lexedPgms.length; i++) {
        $('#parser-text').append("<i>Parsing Program "+(i+1)+"\n</i>");
        if(lexedPgms[i].e && lexedPgms[i].e.lvl == 'error') {
            $('#parser-text').append("<i>Skipping Program "+(i+1)+" with lexical error <br/></i>");
            $('#parser-text').append("<br/>");
            parsedPgms.push("lexical");
            continue;
        }

        let parser = new ParserModule.Parser(lexedPgms[i].t);
        //result :: {log: string[], cst:SyntaxTree | undefined, ast: SyntaxTree | undefined
        //           st:[Symbol]|undefined, e:{lvl:string, msg:string} | null} 
        result = parser.parse();
        let log = result.log;
        for(let i =0; i < log.length; i++) {
            let text = "[PARSER] => "+log[i]+"\n";
            tabOutput("parser",text);
        }
        let err = result.e;
        if(err) {
            let errorMsg = errorSpan("PARSER", err);
            
            logError("parser", errorMsg);
            $("#tab-head-three").addClass(statusColor(err.lvl));
            parsedPgms.push("parse");
            continue;
        } else {
            applyFilter($("#compile-img"), 'default');
            parsedPgms.push(result)
        }
        let st = result.st;
        if(st) {
            tabOutput("parser", "\n[PARSER] => Symbol Table\n");
            for(let i = 0; i < st.length; i++){
                tabOutput("parser", "[PARSER] => "+st[i].toString()+"\n");
            }
        }
        let cst = result.cst;
        if(cst) {
            let lines = cst.toString().split("\n");
            tabOutput("parser", "\n[PARSER] => Concrete Syntax Tree\n");
            for(let i = 0; i < lines.length-1; i++) {
                tabOutput("parser", "[PARSER] => " + lines[i].toString()+"\n");
            }
        }
        tabOutput("parser", "\n");

    }
    time = window.performance.now()-start;

    logOutput("parser", "[PARSER] => Completed in: "+time.toFixed(2)+" ms\n");

    //Semantic Analysis
    let analysedPgms = [];
    console.log(parsedPgms);
    $("#log-text").append("\nStarting Semantic Analysis...\n");
    start = window.performance.now();
    for(let currPgm = 0; currPgm < parsedPgms.length; currPgm++) {
        $('#semantic-text').append("<i>Analyzing Program "+(currPgm+1)+"\n</i>");
        if(parsedPgms[currPgm] == "parse" || parsedPgms[currPgm] == "lexical") {
            $('#semantic-text').append("<i>Skipping Program "+(currPgm+1)+
                " with "+parsedPgms[currPgm]+" error <br/></i>");
            $("#semantic-text").append("</br>");
            analysedPgms.push(parsedPgms[currPgm]);
            continue;
        }
        let semanticAnalyzer = new SemanticAnalysisModule.SemanticAnalyzer(parsedPgms[currPgm].ast);
        //result :: {ast:SyntaxTree, st: SymbolTree, log: string[], warnings: Alert[], error: Alert|undefined}
        result = semanticAnalyzer.analyze();
        let log = result.log;
        for(let i = 0; i < log.length; i++) {
            let text = "[SEMANTIC] => "+log[i]+"\n";
            tabOutput("semantic", text);
        }
        let err = result.error;
        if(err) {
            let errorMsg = errorSpan("SEMANTIC", err);
            logError("semantic", errorMsg);
            $("#tab-head-four").addClass(statusColor(err.lvl));
            analysedPgms.push("semantic");
            continue;
        } else {
            applyFilter($("#compile-img"), 'default');
            analysedPgms.push(result);
        }
        let ast = result.ast;
        if(ast) {
            let lines = ast.toString().split("\n");
            tabOutput("semantic", "\n[SEMANTIC] => Abstract Syntax Tree\n");
            for(let i = 0; i < lines.length-1; i++){
                tabOutput("semantic", "[SEMANTIC] => "+lines[i].toString()+"\n");
            }
        }
        let st = result.st;
        if(st) {
            let lines = st.toString().split("\n");
            tabOutput("semantic", "\n[SEMANTIC] => Symbol Tree\n");
            for(let i =0; i < lines.length-1; i++) {
                tabOutput("semantic", "[SEMANTIC] => "+lines[i].toString()+"\n");
            }
        }
        let warnings = result.warnings; 
        if(warnings.length > 0) {
            for(let i = 0; i < warnings.length; i ++) {
                let warningMsg = errorSpan("SEMANTIC", warnings[i]);
                logError("semantic", warningMsg);
            }
            //Just add color to tab head one time
            $("#tab-head-four").addClass(statusColor(warnings[0].lvl));
        }
        tabOutput("semantic", "\n");
    }
    time = window.performance.now()-start;
    logOutput("semantic", "[SEMANTIC] => Completed in: "+time.toFixed(2)+" ms\n");
    //Go back to editor when complete
    editor.focus();
}

//Split on $ glyph to separate multiple programs into list
preGroup = function(source) {
    source = source.trim();
    let result = [];
    let current = "";
    let inQuotes = false;
    for(let i = 0; i < source.length; i++) {
        current += source[i];
        if(source[i] == '"') {
            inQuotes = !inQuotes;
        }
        if(!inQuotes && source[i] == "$") {
            result.push(current);
            current = "";
        } else if(i == source.length -1){
            result.push(current);
        }
    }
    
    console.log(result);
    return result;
}

lexPgms = function(pgms) {
    let lexer = new LexerModule.Lexer();
    let result = [];
    //Lex each program
    for (let i = 0; i < pgms.length; i++) {
        result.push(lexer.lex(pgms[i]));
    }

    return result; 
}
/*
Working program, blue or green?
const greenFilter = "hue-rotate(220deg)";
const blueFilter = "hue-rotate(310deg)";
*/
const filters = {
    "warning": "hue-rotate(110deg)",
    "error": "hue-rotate(78deg)",
    "neutral": "hue-rotate(220deg)",
    "default": "hue-rotate(0deg)"
}
applyFilter = function(element, color) {
    $(element).css("filter", randomFilter()).delay(250).queue(function(next) {
            $(this).css("filter", filters[color]);
            next();
    });
}
applyRandomFilter = function(element) {
    $(element).css("filter", randomFilter());
}
randomFilter = function() {
    return "hue-rotate("+(160+Math.floor(Math.random()*200))+"deg)";
}
//component: compiler step that has failed
//err: {lvl: string, msg: string}
// lvl: "warning" | "error"
errorSpan = function(component, err) {
    applyFilter($("#compile-img"), err.lvl);
    return $("<span></span>").append("["+component+"] => "+err.lvl+": "+err.msg+"\n")
            .addClass(statusColor(err.lvl));
}
tabOutput = function (target, text) {
    let element = "#"+target+"-text";
    $(element).append($("<span></span>").text(text));
}
logOutput = function (target, text) {
    let element = "#"+target+"-text";
    $(element).append(text);
    $("#log-text").append(text);
}
logError = function (target, obj) {
    let element = "#"+target+"-text";
    $(element).append(obj);
    $("#log-text").append(obj.clone());
}
statusColor = function (type) {
    return 'compile-'+type;
}
clearTabsAndErrors = function(){
    applyFilter($("#compile-img"), 'default');
    //Lexer
    $("#lexer-text").html("");
    $("#tab-head-two").removeClass( function(index, className) {
        return (className.match(/(compile-error|compile-warning)/g)||[]).join(' ');
    });
    //Parser
    $("#parser-text").html("");
    $("#tab-head-three").removeClass( function(index, className) {
        return (className.match(/(compile-error|compile-warning)/g)||[]).join(' ');
    });
    //Semantic
    $("#semantic-text").html("");
    $("#tab-head-four").removeClass(function(index, className) {
        return (className.match(/(compile-error|compile-warning)/g)||[]).join(' ');
    });
}

loadProgram = function(index) {
    editor.setValue(""+programs[index].source,1);
}

setupAceEditor = function() {
    //Setup Ace editor
    editor = ace.edit("editor");
    editor.setFontSize(16);
    editor.setTheme("ace/theme/dracula");
    editor.getSession().setMode("ace/mode/javascript");
    editor.getSession().setOptions({useSoftTabs: true});
    editor.getSession().setUseWorker(false);
    editor.setShowPrintMargin(false);
    editor.$blockScrolling = Infinity;
    //Vim Mode toggling
    editorMode = "default";
    window.toggleEditorMode = function (btn) {
        if (editorMode === "default") {
            editor.setKeyboardHandler("ace/keyboard/vim");
            editorMode = "vim";
            $("#mode-toggle-button").text("Editor Mode: Vim");
        } else {
            editor.setKeyboardHandler("");
            editorMode = "default";
            $("#mode-toggle-button").text("Editor Mode: Default");
        }
        editor.focus();
    }
}
setupMemoryGauge = function () {
    //Setup Memory gauge for machine code
    var gauge = new JustGage({
        id: "memory-gauge",
        value: getRandomInt(0, 256), //test
        min: 0,
        max: 256, //Replace with real max byte
        height:160,
        width:180,
        gaugeColor: "#44475a",
        levelColors: ["#bd93f9", "#ff5555"],
        title:"Bytes used",
        titleFontColor: "#f8f8f2",
        titleFontFamily: 'monospace',
        valueFontColor: "#f8f8f2",
        valueFontFamily: 'monospace'
    });
    //Just for testing gauge
    setInterval(function() { gauge.refresh(getRandomInt(0,256))}, 2000);

}
setupProgramList = function() {
    //Setup clickable Example Program List
    programs.forEach(element => {
        let item = $("<span class='dropdown-item'></span")
            .html(element.name)
            .css("cursor", "pointer")
            .on('click', function() {editor.setValue(""+element.source, 1)});
        if(element.type != null) {
            item.addClass(statusColor(element.type))
        }
        $(".dropdown-menu").append(item);
    });

}

},{"../dist/Lexer.js":2,"../dist/Parser.js":3,"../dist/SemanticAnalyzer.js":4,"./examples":9}]},{},[10]);
