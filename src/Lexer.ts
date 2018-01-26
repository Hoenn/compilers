import {Token, TokenRegex, TokenType} from './Token';
export class Lexer {

    lex(src: string): Token[] {
        //Break text into blobs to perform longest match on
        //filter out undefined blobs
        let tokenBlob = src.split(TokenRegex.Split).filter((defined) => defined);
        
        let lineNum = 0;
        let tokens: Token[] = [];
        for(let blob of tokenBlob) {
            if(blob.match("\n")) {
                lineNum += 1;
            }
            var result = longestMatch(blob);
            if(result) {
                //Fix colNum
                tokens.push(new Token (result, blob, lineNum, 0));
            } else {
                console.log('Invalid lexeme: "'+blob+'" on line: '+lineNum)
            }
            console.log(blob);
        }
        return tokens; 
    }
    longestMatch(blob: string): TokenType|null {
        return null;
    }

}
