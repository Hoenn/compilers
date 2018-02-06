"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Token_1 = require("./Token");
var Lexer = /** @class */ (function () {
    function Lexer() {
    }
    Lexer.prototype.lex = function (src) {
        //Break text into blobs to perform longest match on
        //filter out undefined blobs
        var tokenBlobs = src.split(Token_1.TokenRegex.Split).filter(function (defined) { return defined; });
        var lineNum = 1;
        console.log(tokenBlobs);
        var tokens = [];
        var result = { t: null, e: null };
        for (var _i = 0, tokenBlobs_1 = tokenBlobs; _i < tokenBlobs_1.length; _i++) {
            var blob = tokenBlobs_1[_i];
            //If newline is found increment lineNum but skip
            //If a comment or whitespace just skip
            if (blob.match("\n")) {
                lineNum += 1;
                continue;
            }
            else if (blob.match(Token_1.TokenRegex.Comment) || blob.match(Token_1.TokenRegex.WhiteSpace)) {
                console.log();
                continue;
            }
            result = this.longestMatch(blob, lineNum);
            if (result.t) {
                for (var _a = 0, _b = result.t; _a < _b.length; _a++) {
                    var t = _b[_a];
                    tokens.push(t);
                }
            }
            //It's possible to have valid tokens returned along with an error
            if (result.e) {
                console.log(result.e);
                break;
            }
        }
        //If we have no errors, check if EOP is missing. No need if there are other lex errors
        if (result.e === null) {
            if (tokens[tokens.length - 1].kind != Token_1.TokenType.EOP) {
                tokens.push(new Token_1.Token(Token_1.TokenType.EOP, "$", lineNum));
                result.e = this.warning("End of Program missing. Added $ symbol.");
            }
        }
        console.log(tokens);
        return { t: tokens, e: result.e };
    };
    Lexer.prototype.longestMatch = function (blob, lineNum) {
        //Test the blob for each allowed token
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
                    //If it's a letter or space add that token
                    tokenArray.push(new Token_1.Token(Token_1.TokenType.Char, char, lineNum));
                }
                else {
                    //"quoted" may only contain valid lexemes (chars)
                    return { t: tokenArray, e: this.error(char, lineNum) };
                }
            }
            return { t: tokenArray, e: null };
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
                console.log(blob);
                //If the blob doesn't contain any keywords and reached here it must not be valid
                return { t: null, e: this.error(blob, lineNum) };
            }
        }
    };
    Lexer.prototype.error = function (blob, lineNum) {
        return { lvl: "error", msg: "Unknown token " + blob.trim() + " on line " + lineNum };
    };
    Lexer.prototype.warning = function (m) {
        return { lvl: "warning", msg: m };
    };
    return Lexer;
}());
exports.Lexer = Lexer;
