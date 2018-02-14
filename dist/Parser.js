"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Token_1 = require("./Token");
var SyntaxTree_1 = require("./SyntaxTree");
var Parser = /** @class */ (function () {
    function Parser(tokens) {
        //Add initial program token, make root node
        this.cst = new SyntaxTree_1.SyntaxTree(new SyntaxTree_1.Node("Program", null, ""));
        this.tokens = tokens;
    }
    Parser.prototype.parse = function () {
        var errors = this.parseBlock();
        this.consume(["$"], Token_1.TokenType.EOP);
        console.log("Errors: " + errors);
        return this.cst;
        //return syntax tree and errors        
    };
    Parser.prototype.parseBlock = function () {
        this.cst.addBranchNode(new SyntaxTree_1.Node("Block", null, ""));
        var error = this.consume(["{"], Token_1.TokenType.LBracket);
        if (error) {
            return error;
        }
        this.parseStatementList();
        error = this.consume(["}"], Token_1.TokenType.RBracket);
        if (error) {
            return error;
        }
        this.cst.moveCurrentUp();
    };
    Parser.prototype.parseStatementList = function () {
    };
    Parser.prototype.consume = function (search, want) {
        var cToken = this.tokens.shift();
        if (cToken) {
            for (var _i = 0, search_1 = search; _i < search_1.length; _i++) {
                var exp = search_1[_i];
                if (cToken.value.match(exp)) {
                    this.cst.addLeafNode(new SyntaxTree_1.Node(cToken.kind, null, cToken.value));
                    return null;
                }
            }
        }
        else {
            //Should never happen if Lex was passed
            return "Unexpected end of input";
        }
        return "Expected " + want + " got " + cToken.kind + " on line " + cToken.lineNum;
    };
    return Parser;
}());
exports.Parser = Parser;
