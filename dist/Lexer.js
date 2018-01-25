"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Lexer = /** @class */ (function () {
    function Lexer() {
    }
    Lexer.prototype.lex = function (src) {
        for (var _i = 0, src_1 = src; _i < src_1.length; _i++) {
            var char = src_1[_i];
        }
        return ["asd"];
    };
    Lexer.prototype.removeWhiteSpace = function (s) {
        return s.replace(/\s/g, "");
    };
    Lexer.prototype.removeComments = function (s) {
        //Remove comments, won't work for multi line yet
        return s.replace("/\*.*\*/", "");
    };
    return Lexer;
}());
exports.Lexer = Lexer;
