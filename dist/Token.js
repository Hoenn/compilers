"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Token = /** @class */ (function () {
    function Token(kind, value, lineNum) {
        this.kind = kind;
        this.value = value;
        this.lineNum = lineNum;
    }
    return Token;
}());
//Master list of available token types
var TokenType;
(function (TokenType) {
    TokenType[TokenType["EOP"] = 0] = "EOP";
    TokenType[TokenType["While"] = 1] = "While";
    TokenType[TokenType["If"] = 2] = "If";
    TokenType[TokenType["Print"] = 3] = "Print";
    TokenType[TokenType["IntType"] = 4] = "IntType";
    TokenType[TokenType["StringType"] = 5] = "StringType";
    TokenType[TokenType["BoolType"] = 6] = "BoolType";
    TokenType[TokenType["BoolLiteral"] = 7] = "BoolLiteral";
    TokenType[TokenType["Id"] = 8] = "Id";
    TokenType[TokenType["Char"] = 9] = "Char";
    TokenType[TokenType["CharList"] = 10] = "CharList";
    TokenType[TokenType["Integer"] = 11] = "Integer";
    TokenType[TokenType["Equals"] = 12] = "Equals";
    TokenType[TokenType["NotEquals"] = 13] = "NotEquals";
    TokenType[TokenType["LParen"] = 14] = "LParen";
    TokenType[TokenType["RParen"] = 15] = "RParen";
    TokenType[TokenType["Assign"] = 16] = "Assign";
    TokenType[TokenType["Addition"] = 17] = "Addition";
})(TokenType || (TokenType = {}));
exports.TokenStrings = {
    EOP: '(^|\s)[$]($|\s)',
    While: '(^|\s)while($|\s)',
    If: '(^|\s)if($|\s)',
    Print: '(^|\s)print($|\s)',
    IntType: '(^|\s)int($|\s)',
    StringType: '(^|\s)string($|\s)',
    BoolType: '(^|\s)boolean($|\s)',
    BoolLiteral: '(^|\s)(true|false)($|\s)',
    Id: '[a-z]',
    Char: '[a-z]',
    CharList: '[a-z][a-z\s]+',
    Integer: '[0-9]',
    Equals: '[==]',
    NotEquals: '[!=]',
    LParen: '[(]',
    RParen: '[)]',
    Assign: '[=]',
    Addition: '[+]'
};
