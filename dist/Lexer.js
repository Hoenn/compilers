"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Token_1 = require("./Token");
var Lexer = /** @class */ (function () {
    function Lexer() {
    }
    Lexer.prototype.lex = function (src) {
        //Break text into blobs to perform longest match on
        //filter out undefined blobs
        var tokenBlob = src.split(Token_1.TokenRegex.Split).filter(function (defined) { return defined; });
        console.log(tokenBlob);
        var lineNum = 0;
        var tokens = [];
        for (var _i = 0, tokenBlob_1 = tokenBlob; _i < tokenBlob_1.length; _i++) {
            var blob = tokenBlob_1[_i];
            if (blob.match("\n")) {
                lineNum += 1;
                continue;
            }
            else if (blob.match(Token_1.TokenRegex.Comment) || blob.match(Token_1.TokenRegex.WhiteSpace)) {
                continue;
            }
            var result = this.longestMatch(blob);
            if (result) {
                tokens.push(new Token_1.Token(result, blob, lineNum));
            }
            else {
                console.log('Invalid lexeme: "' + blob + '" on line: ' + lineNum);
            }
        }
        console.log(tokens);
        return tokens;
    };
    Lexer.prototype.longestMatch = function (blob) {
        if (Token_1.TokenRegex.While.test(blob)) {
            return Token_1.TokenType.While;
        }
        else if (Token_1.TokenRegex.Print.test(blob)) {
            return Token_1.TokenType.Print;
        }
        else if (Token_1.TokenRegex.EOP.test(blob)) {
            return Token_1.TokenType.EOP;
        }
        else if (Token_1.TokenRegex.LBracket.test(blob)) {
            return Token_1.TokenType.LBracket;
        }
        else if (Token_1.TokenRegex.RBracket.test(blob)) {
            return Token_1.TokenType.RBracket;
        }
        else if (Token_1.TokenRegex.Id.test(blob)) {
            return Token_1.TokenType.Id;
        }
        return null;
    };
    return Lexer;
}());
exports.Lexer = Lexer;
