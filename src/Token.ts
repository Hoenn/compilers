export class Token {
    kind: TokenType;
    value: string;
    lineNum: number;

    constructor(kind: TokenType, value: string, lineNum: number) {
        this.kind = kind;
        this.value = value;
        this.lineNum = lineNum;
    }

}
//Master list of available token types
export enum TokenType {
    EOP="EOP",
    While ="While",
    If ="If",
    Print="Print",
    VarType="VarType",
    BoolLiteral="BoolLiteral",
    Id ="Id",
    Char="Char",
    Digit="Digit",
    LParen="LParen",
    RParen="RParen",
    Quote ="Quote",
    LBracket="LBracket",
    RBracket="RBracket",
    Assign="Assign",
    BoolOp="BoolOp",
    IntOp="IntOp"
}
//Used  to calculate starting colNum of a token
//Not used right now, leaving just in case
export const TokenGlyphs:{[key:string]:string}= {
    "EOP": "$",
    "While": "while",
    "If": "if",
    "Print": "print",
    "Id": ""
}
export const TokenRegex:{[key:string]:RegExp } = {
    //Break on characters -> digits -> "any/*text*/" -> /*comments*/ -> symbols and new lines
    Split: new RegExp(/([a-z]+)|([0-9])|("[^"]*")|(\/\*.*\*\/)|(=|==|!=|\$|{|}|\(|\)|\+|\s)/g),
    WhiteSpace: new RegExp(/^(\s)$/g),
    //Match any keyword first, then valid ids after
    Keywords: new RegExp(/(int|boolean|string|while|print|if|true|false|[a-z])/g),
    Comment: new RegExp(/^\/\*.*\*\/$/),
    EOP: new RegExp(/(^|\s)[$]($|\s)/),
    While: new RegExp(/(^|\s)while($|\s)/),
    If: new RegExp(/(^|\s)if($|\s)/),
    Print: new RegExp(/(^|\s)print($|\s)/),
    VarType: new RegExp(/(^|\s)(int|boolean|string)($|\s)/g),
    BoolLiteral: new RegExp(/(^|\s)(true|false)($|\s)/),
    Id: new RegExp(/^[a-z]$/),
    Quote : new RegExp(/(".*)/g),
    Char: new RegExp(/[a-z]/),
    Digit: new RegExp(/^[0-9]$/),
    LParen: new RegExp(/(\()/),
    RParen: new RegExp(/(\))/),
    LBracket: new RegExp(/({)/),
    RBracket: new RegExp(/(})/),
    Assign: new RegExp(/(=)/),
    BoolOp: new RegExp(/(==)|(!=)/),
    IntOp: new RegExp(/(\+)/)

}
