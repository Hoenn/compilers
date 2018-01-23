"use strict";
//Master list of available token types
var TokenType;
(function (TokenType) {
    TokenType[TokenType["T_EOP"] = 0] = "T_EOP";
    TokenType[TokenType["T_While"] = 1] = "T_While";
    TokenType[TokenType["T_If"] = 2] = "T_If";
    TokenType[TokenType["T_Print"] = 3] = "T_Print";
    TokenType[TokenType["T_IntType"] = 4] = "T_IntType";
    TokenType[TokenType["T_StringType"] = 5] = "T_StringType";
    TokenType[TokenType["T_BoolType"] = 6] = "T_BoolType";
    TokenType[TokenType["T_BoolLiteral"] = 7] = "T_BoolLiteral";
    TokenType[TokenType["T_Id"] = 8] = "T_Id";
    TokenType[TokenType["T_Char"] = 9] = "T_Char";
    TokenType[TokenType["T_CharList"] = 10] = "T_CharList";
    TokenType[TokenType["T_Integer"] = 11] = "T_Integer";
    TokenType[TokenType["T_Equals"] = 12] = "T_Equals";
    TokenType[TokenType["T_NotEquals"] = 13] = "T_NotEquals";
    TokenType[TokenType["T_LParen"] = 14] = "T_LParen";
    TokenType[TokenType["T_RParen"] = 15] = "T_RParen";
    TokenType[TokenType["T_Assign"] = 16] = "T_Assign";
    TokenType[TokenType["T_Addition"] = 17] = "T_Addition";
})(TokenType || (TokenType = {}));
