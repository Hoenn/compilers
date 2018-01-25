import {Token, TokenRegex, TokenType} from './Token';
export class Lexer {

    lex(src: string): string[] {
        src = this.removeComments(src);

        let tokens: Token[] = [];
        var currTok = "";
        for(var char of src) {
            currTok += char;
            //If currTok matches whitespace
            if(TokenRegex.WhiteSpace.test(currTok)){
                currTok = "";
            } else if (TokenRegex.While.test(currTok)) {
                tokens.push(new Token(TokenType.While, "", -1 ))
                currTok = "";
            }

        }
        return [];
    }
    removeWhiteSpace(s: string): string {
        return s.replace(/\s/g, "");
    }
    removeComments(s: string): string {
        //Remove comments, won't work for multi line yet
        return s.replace("/\*.*\*/", "");
    }
}
