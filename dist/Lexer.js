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
        var lineNum = 1;
        var tokens = [];
        for (var _i = 0, tokenBlob_1 = tokenBlob; _i < tokenBlob_1.length; _i++) {
            var blob = tokenBlob_1[_i];
            //If newline is found increment lineNum but skip
            //If a comment or whitespace just skip
            if (blob.match("\n")) {
                lineNum += 1;
                continue;
            }
            else if (blob.match(Token_1.TokenRegex.Comment) || blob.match(Token_1.TokenRegex.WhiteSpace)) {
                continue;
            }
            var result = this.longestMatch(blob, lineNum);
            if (result.t) {
                for (var _a = 0, _b = result.t; _a < _b.length; _a++) {
                    var t = _b[_a];
                    tokens.push(t);
                }
            }
            if (result.e) {
                console.log(result.e);
                break;
            }
        }
        console.log(tokens);
        return tokens;
    };
    Lexer.prototype.longestMatch = function (blob, lineNum) {
        if (Token_1.TokenRegex.While.test(blob)) {
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
        else if (Token_1.TokenRegex.Quote.test(blob)) {
            var splitQuote = blob.split("");
            console.log(blob);
            console.log(splitQuote);
            var tokenArray = [];
            for (var _i = 0, splitQuote_1 = splitQuote; _i < splitQuote_1.length; _i++) {
                var char = splitQuote_1[_i];
                if (char === "\"") {
                    tokenArray.push(new Token_1.Token(Token_1.TokenType.Quote, char, lineNum));
                }
                else if (char.match(/[a-z]/g)) {
                    tokenArray.push(new Token_1.Token(Token_1.TokenType.Char, char, lineNum));
                }
                else {
                    return { t: tokenArray, e: "Unknown lexeme " + char + " on " + lineNum };
                }
            }
            return { t: tokenArray, e: null };
        }
        else if (Token_1.TokenRegex.LBracket.test(blob)) {
            return { t: [new Token_1.Token(Token_1.TokenType.LBracket, blob, lineNum)], e: null };
        }
        else if (Token_1.TokenRegex.RBracket.test(blob)) {
            return { t: [new Token_1.Token(Token_1.TokenType.RBracket, blob, lineNum)], e: null };
        } //Handle the case of no match by breaking on keywords
        return { t: null, e: "errormsg" };
    };
    return Lexer;
}());
exports.Lexer = Lexer;
