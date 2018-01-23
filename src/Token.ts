class Token {
    kind: TokenType;
    value: string;
    lineNum: number;

    constructor(kind: TokenType, value: string, lineNum: number) {
        this.kind = kind;
        this.value = value;
        this.lineNum = lineNum;
    }

}
