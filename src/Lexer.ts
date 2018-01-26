import {Token, TokenRegex, TokenType} from './Token';
export class Lexer {

    lex(src: string): Token[] {
        //Break text into blobs to perform longest match on
        //filter out undefined blobs
        let tokenBlob = src.split(TokenRegex.Split).filter((defined) => defined);
        let lineNum = 0;
        let tokens: Token[] = [];
        for(let blob of tokenBlob) {
            //If newline is found increment lineNum but skip
            //If a comment or whitespace just skip
            if(blob.match("\n")) {
                lineNum += 1;
                continue;
            } else if (blob.match(TokenRegex.Comment) || blob.match(TokenRegex.WhiteSpace)){
                continue;
            }
            var result = this.longestMatch(blob);
            if(result) { //is not null
                tokens.push(new Token (result, blob, lineNum));
            } else {
                console.log('Invalid lexeme: "'+blob+'" on line: '+lineNum)
            }
        }
        console.log(tokens);
        return tokens; 
    }
    longestMatch(blob: string): TokenType|null {
        if(TokenRegex.While.test(blob)){
            return TokenType.While;
        } else if(TokenRegex.Print.test(blob)){
            return TokenType.Print;
        } else if(TokenRegex.EOP.test(blob)){
            return TokenType.EOP;
        }  else if (TokenRegex.LBracket.test(blob)) {
            return TokenType.LBracket;
        } else if (TokenRegex.RBracket.test(blob)) {
            return TokenType.RBracket;
        } else if (TokenRegex.Id.test(blob)) {
            return TokenType.Id;
        }
        return null;
    }

}
