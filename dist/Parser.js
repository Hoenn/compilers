"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Token_1 = require("./Token");
var SyntaxTree_1 = require("./SyntaxTree");
var Alert_1 = require("./Alert");
var Parser = /** @class */ (function () {
    function Parser(tokens) {
        //Add initial program token, make root node
        this.cst = new SyntaxTree_1.SyntaxTree(new SyntaxTree_1.Node("Program"));
        this.tokens = tokens;
        this.log = [];
    }
    Parser.prototype.parse = function () {
        this.emit("program");
        var err = this.parseBlock();
        if (err) {
            return { log: this.log, cst: null, e: err };
        }
        err = this.consume(["[$]"], Token_1.TokenType.EOP);
        if (err) {
            return { log: this.log, cst: null, e: err };
        }
        return { log: this.log, cst: this.cst, e: err };
        //return syntax tree and errors        
    };
    Parser.prototype.parseBlock = function () {
        this.emit("block");
        this.cst.addBranchNode(new SyntaxTree_1.Node("Block"));
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
    };
    Parser.prototype.parseStatementList = function () {
        this.cst.addBranchNode(new SyntaxTree_1.Node("StatementList"));
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
        this.cst.addBranchNode(new SyntaxTree_1.Node("Statement"));
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
                //err = this.parseVarDecl();
                break;
            }
            case Token_1.TokenType.While: {
                //err = this.parseWhile();
                break;
            }
            case Token_1.TokenType.If: {
                //err = this.parseIf();
                break;
            }
            case Token_1.TokenType.Id: {
                //err = this.parseAssignment();
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
        this.cst.addBranchNode(new SyntaxTree_1.Node("PrintStatement"));
        this.consume(["print"], "print");
        //"[(]" since ( alone throws malformed RegExp error
        // /\(/ also accomplishes the same
        this.consume(["[(]"], "(");
        var err = this.parseExpr();
        if (err) {
            return err;
        }
        this.consume(["[)]"], ")");
        this.cst.moveCurrentUp();
    };
    Parser.prototype.parseExpr = function () {
        this.emit("expression");
        this.cst.addBranchNode(new SyntaxTree_1.Node("Expression"));
        var nToken = this.tokens[0].kind;
        switch (nToken) {
            case Token_1.TokenType.Digit: {
                var err = this.parseIntExpr();
                if (err) {
                    return err;
                }
                break;
            }
            default: {
                return Alert_1.error("Expected Int|Boolean|String expression or Id got " +
                    this.tokens[0].kind, this.tokens[0].lineNum);
            }
        }
        this.cst.moveCurrentUp();
    };
    Parser.prototype.parseIntExpr = function () {
        this.emit("int expression");
        this.cst.addBranchNode(new SyntaxTree_1.Node("IntExpr"));
        var err = this.consume([Token_1.TokenRegex.Digit], "Digit");
        if (err) {
            return err;
        }
        var nToken = this.tokens[0].kind;
        if (nToken == Token_1.TokenType.IntOp) {
            err = this.consume([Token_1.TokenRegex.IntOp], "Plus");
            if (err) {
                return err;
            }
            err = this.parseIntExpr();
            if (err) {
                return err;
            }
        }
        this.cst.moveCurrentUp();
    };
    //search[] may contain string | RegExp
    //want:string is needed for error reporting in case a list of
    //  possible input is being searched for
    Parser.prototype.consume = function (search, want) {
        var cToken = this.tokens.shift();
        if (cToken) {
            for (var _i = 0, search_1 = search; _i < search_1.length; _i++) {
                var exp = search_1[_i];
                if (cToken.value.match(exp)) {
                    this.cst.addLeafNode(new SyntaxTree_1.Node(cToken.kind));
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
    return Parser;
}());
exports.Parser = Parser;
