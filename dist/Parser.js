"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Token_1 = require("./Token");
var SyntaxTree_1 = require("./SyntaxTree");
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
            console.log("Errors: " + error);
            return { log: this.log, cst: this.cst, e: error };
        }
        this.consume(["$"], Token_1.TokenType.EOP);
        return { log: this.log, cst: this.cst, e: undefined };
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
        //If next token is a statement
        //let error = this.parseStatementList()
        this.cst.moveCurrentUp();
    };
    Parser.prototype.parseStatement = function () {
        this.emit("statement");
        this.cst.addBranchNode(new SyntaxTree_1.Node("Statement"));
        //Check if nextToken is print
        var nToken = this.tokens[0].kind;
        var error;
        switch (nToken) {
            case Token_1.TokenType.LBracket: {
                error = this.parseBlock();
                break;
            }
            case Token_1.TokenType.Print: {
                //error = this.parsePrint();
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
        if (error) {
            return error;
        }
        this.cst.moveCurrentUp();
    };
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
            return "Unexpected end of input";
        }
        return "Expected " + want + " got " + cToken.kind + " on line " + cToken.lineNum;
    };
    Parser.prototype.emit = function (s) {
        this.log.push("Parsing " + s);
    };
    return Parser;
}());
exports.Parser = Parser;
