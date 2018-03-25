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
            this.addASTBranch("+", this.tokens[0].lineNum);
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
            this.addASTBranch("==", nToken.lineNum);
            err = this.consume(["[(]"], Token_1.TokenType.LParen);
            if (err) {
                return err;
            }
            err = this.parseExpr();
            if (err) {
                return err;
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
