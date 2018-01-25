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
    EOP,
    While,
    If,
    Print,
    IntType,
    StringType,
    BoolType,
    BoolLiteral,
    Id,
    Char,
    CharList,
    Integer,
    Equals,
    NotEquals,
    LParen,
    RParen,
    Assign,
    Addition
}
export const TokenRegex = {
    WhiteSpace: new RegExp('\s'),
    EOP: new RegExp('(^|\s)[$]($|\s)'),
    While: new RegExp('(^|\s)while($|\s)'),
    If: new RegExp('(^|\s)if($|\s)'),
    Print: new RegExp('(^|\s)print($|\s)'),
    IntType: new RegExp('(^|\s)int($|\s)'),
    StringType: new RegExp('(^|\s)string($|\s)'),
    BoolType: new RegExp('(^|\s)boolean($|\s)'),
    BoolLiteral: new RegExp('(^|\s)(true|false)($|\s)'),
    Id: new RegExp('[a-z]'),
    Char: new RegExp('[a-z]'),
    CharList: new RegExp('[a-z][a-z\s]+'),
    Integer: new RegExp('[0-9]'),
    Equals: new RegExp('[==]'),
    NotEquals: new RegExp('[!=]'),
    LParen: new RegExp('[(]'),
    RParen: new RegExp('[)]'),
    Assign: new RegExp('[=]'),
    Addition: new RegExp('[+]')

}