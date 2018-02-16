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
        var error = this.parseBlock();
        if (error) {
            return { log: this.log, cst: this.cst, e: error };
        }
        error = this.consume(["[$]"], Token_1.TokenType.EOP);
        return { log: this.log, cst: this.cst, e: error };
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
        this.emit("statement list");
        this.cst.addBranchNode(new SyntaxTree_1.Node("StatementList"));
        var error = this.parseStatement();
        if (error) {
            return error;
        }
        //See if next token would start a valid statement
        //If so, recurse, if not moveUp
        var nToken = this.tokens[0].value;
        if (nToken.match(Token_1.TokenRegex.Statement)) {
            error = this.parseStatementList();
            if (error) {
                return error;
            }
        }
        this.cst.moveCurrentUp();
    };
    Parser.prototype.parseStatement = function () {
        this.emit("statement");
        this.cst.addBranchNode(new SyntaxTree_1.Node("Statement"));
        //Look at next token to decide how to parse
        var nToken = this.tokens[0].kind;
        var error;
        switch (nToken) {
            case Token_1.TokenType.LBracket: {
                error = this.parseBlock();
                break;
            }
            case Token_1.TokenType.Print: {
                error = this.parsePrint();
                break;
            }
            case Token_1.TokenType.VarType: {
                //error = this.parseVarDecl();
                break;
            }
            case Token_1.TokenType.While: {
                //error = this.parseWhile();
                break;
            }
            case Token_1.TokenType.If: {
                //error = this.parseIf();
                break;
            }
            case Token_1.TokenType.Id: {
                //error = this.parseAssignment();
                break;
            }
            default: {
                //Either empty statement or unknown token
                //parseBlock will catch unknown or correctly find RBracket
                this.cst.moveCurrentUp();
                return;
            }
        }
        //Propagate any errors from switch
        if (error) {
            return error;
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
        //let error = parseExpr()
        //if (error) {
        //  return error;
        //}
        this.consume(["[)]"], ")");
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
