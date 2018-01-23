"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Lexer = /** @class */ (function () {
    function Lexer() {
    }
    Lexer.lex = function (src) {
        //Return output of actual lex which will be
        //Preformatted output of:
        ////Ordered List of Tokens
        /////Which Token Where Summary
        ///List of Warnings and Errors
        //Example output
        //{
        // int x = 5
        //}
        //$
        return "LEXER: { on Line 1 \n\n        LEXER: int on Line 2 \n\n        LEXER: x on Line 3 \n\n        LEXER: = on Line 2 \n\n        LEXER: 5 on Line 2 \n\n        LEXER: } on Line 3 \n\n        Lexer: $ on Line 4 \n";
    };
    return Lexer;
}());
exports.Lexer = Lexer;
