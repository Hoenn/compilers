import {Token, TokenRegex, TokenType} from './Token';
export class Lexer {

    lex(src: string): Token[] {
        //Break text into blobs to perform longest match on
        //filter out undefined blobs
        let tokenBlob = src.split(TokenRegex.Split).filter((defined) => defined);
        
        let lineNum = 0;
        let tokens: Token[] = [];
        for(let blob of tokenBlob) {
            console.log(blob);
        }
        return tokens; 
    }

}
