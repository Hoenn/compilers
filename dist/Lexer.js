"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Token_1 = require("./Token");
var Lexer = /** @class */ (function () {
    function Lexer() {
    }
    Lexer.prototype.lex = function (src) {
        src = this.removeComments(src);
        var lineNum = 0;
        var colNum = 0;
        var tokens = [];
        var currTok = "";
        for (var _i = 0, src_1 = src; _i < src_1.length; _i++) {
            var char = src_1[_i];
            currTok += char;
            colNum = 0;
            //If currTok matches whitespace
            if (Token_1.TokenRegex.WhiteSpace.test(currTok)) {
                if (currTok.match("\n")) {
                    lineNum++;
                }
                currTok = "";
            }
            else if (Token_1.TokenRegex.While.test(currTok)) {
                tokens.push(new Token_1.Token(Token_1.TokenType.While, "", lineNum));
                currTok = "";
            }
        }
        return tokens;
    };
    Lexer.prototype.removeWhiteSpace = function (s) {
        return s.replace(/\s/g, "");
    };
    Lexer.prototype.removeComments = function (s) {
        //Remove comments, won't work for multi line yet
        s = s.replace(/\/\*.*\*\//g, this.withWhiteSpace);
        console.log(s);
        return s;
    };
    Lexer.prototype.withWhiteSpace = function (match) {
        var spaces = new Array(match.length + 1).join(' ');
        return spaces;
    };
    return Lexer;
}());
exports.Lexer = Lexer;
