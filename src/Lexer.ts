import {Token, TokenRegex, TokenType} from './Token';
export class Lexer {

    lex(src: string): Token[] {
        src = this.removeComments(src);

        let lineNum = 0;
        let colNum = 0;
        let tokens: Token[] = [];

        var currTok = "";
        for(var char of src) {
            currTok += char;
            colNum = 0;
            //If currTok matches whitespace
            if(TokenRegex.WhiteSpace.test(currTok)){
                if(currTok.match("\n")){
                    lineNum++;
                }
                currTok = "";
            } else if (TokenRegex.While.test(currTok)) {
                tokens.push(new Token(TokenType.While, "", lineNum ))
                currTok = "";
            }

        }
        return tokens; 
    }
    removeWhiteSpace(s: string): string {
        return s.replace(/\s/g, "");
    }
    removeComments(s: string): string {
        //Remove comments, won't work for multi line yet
        s = s.replace(/\/\*.*\*\//g, this.withWhiteSpace);
        console.log(s);
        return s; 
       }
 
    withWhiteSpace(match: any): string {
        let spaces = new Array(match.length+1).join(' ');
        return spaces;
    }
}
