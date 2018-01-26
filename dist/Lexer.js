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
        var lineNum = 0;
        var tokens = [];
        for (var _i = 0, tokenBlob_1 = tokenBlob; _i < tokenBlob_1.length; _i++) {
            var blob = tokenBlob_1[_i];
            console.log(blob);
        }
        return tokens;
    };
    return Lexer;
}());
exports.Lexer = Lexer;
