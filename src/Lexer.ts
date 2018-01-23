export class Lexer {
    static lex(src: string):string {
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
        return `LEXER: { on Line 1 \n
        LEXER: int on Line 2 \n
        LEXER: x on Line 3 \n
        LEXER: = on Line 2 \n
        LEXER: 5 on Line 2 \n
        LEXER: } on Line 3 \n
        Lexer: $ on Line 4 \n`

    }
}
