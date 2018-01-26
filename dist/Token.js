"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Token = /** @class */ (function () {
    function Token(kind, value, lineNum, colNum) {
        this.kind = kind;
        this.value = value;
        this.lineNum = lineNum;
        //Adjust the colnum to the beginning of the lexeme
        this.colNum = colNum - exports.TokenLexeme[kind].length;
    }
    return Token;
}());
exports.Token = Token;
//Master list of available token types
var TokenType;
(function (TokenType) {
    TokenType["EOP"] = "EOP";
    TokenType["While"] = "While";
    TokenType["If"] = "If";
    TokenType["Print"] = "Print";
    TokenType["IntType"] = "IntType";
    TokenType["StringType"] = "StringType";
    TokenType["BoolType"] = "BoolType";
    TokenType["BoolLiteral"] = "BoolLiteral";
    TokenType["Id"] = "Id";
    TokenType["Char"] = "Char";
    TokenType["CharList"] = "CharList";
    TokenType["Integer"] = "Integer";
    TokenType["Equals"] = "Equals";
    TokenType["NotEquals"] = "NotEquals";
    TokenType["LParen"] = "LParen";
    TokenType["RParen"] = "RParen";
    TokenType["Assign"] = "Assign";
    TokenType["Addition"] = "Addition";
})(TokenType = exports.TokenType || (exports.TokenType = {}));
exports.TokenLexeme = {
    "EOP": "$",
    "While": "while",
    "If": "if",
    "Print": "print",
    "Id": ""
};
exports.TokenRegex = {
    //Break on characters -> digits -> "any/*text*/" -> /*comments*/ -> symbols and new lines
    Split: new RegExp(/([a-z]+)|([0-9]+)|(".*")(\/\*.*\*\/)(=|==|!=|\$|{|}|\+|\n)/g),
    WhiteSpace: new RegExp(/\s/),
    EOP: new RegExp(/(^|\s)[$]($|\s)/),
    While: new RegExp(/(^|\s)while($|\s)/),
    If: new RegExp(/(^|\s)if($|\s)/),
    Print: new RegExp(/(^|\s)print($|\s)/),
    IntType: new RegExp(/(^|\s)int($|\s)/),
    StringType: new RegExp(/(^|\s)string($|\s)/),
    BoolType: new RegExp(/(^|\s)boolean($|\s)/),
    BoolLiteral: new RegExp(/(^|\s)(true|false)($|\s)/),
    Id: new RegExp(/^[a-z]$/),
    Char: new RegExp(/[a-z]/),
    CharList: new RegExp(/[a-z][a-z\s]+/),
    Integer: new RegExp(/[0-9]/),
    Equals: new RegExp(/[==]/),
    NotEquals: new RegExp(/[!=]/),
    LParen: new RegExp(/[(]/),
    RParen: new RegExp(/[)]/),
    Assign: new RegExp(/[=]/),
    Addition: new RegExp(/[+]/)
};
