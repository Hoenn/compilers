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
    IntType="IntType",
    StringType="StringType",
    BoolType="BoolType",
    BoolLiteral="BoolLiteral",
    Id ="Id",
    Char="Char",
    CharList="CharList",
    Integer="Integer",
    Equals="Equals",
    NotEquals="NotEquals",
    LParen="LParen",
    RParen="RParen",
    LBracket="{",
    RBracket="}",
    Assign="Assign",
    Addition="Addition"
}

export const TokenLexeme:{[key:string]:string}= {
    "EOP": "$",
    "While": "while",
    "If": "if",
    "Print": "print",
    "Id": ""
}
export const TokenRegex = {
    //Break on characters -> digits -> "any/*text*/" -> /*comments*/ -> symbols and new lines
    Split: new RegExp(/([a-z]+)|([0-9]+)|(".*")|(\/\*.*\*\/)|(=|==|!=|\$|{|}|\+|\n)/g),
    WhiteSpace: new RegExp(/\s/g),
    Comment: new RegExp(/\/\*.*\*\//),
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
    LBracket: new RegExp(/[{]/),
    RBracket: new RegExp(/[}]/),
    Assign: new RegExp(/[=]/),
    Addition: new RegExp(/[+]/)

}