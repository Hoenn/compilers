import {Token, TokenRegex, TokenType} from './Token';
import { join } from 'path';
export class Lexer {

    lex(src: string): Token[] {
        //Break text into blobs to perform longest match on
        //filter out undefined blobs
        let tokenBlob = src.split(TokenRegex.Split).filter((defined) => defined);
        let lineNum = 1;
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
            var result = this.longestMatch(blob, lineNum);
            if(result.t) { //is not null
                for(let t of result.t){
                    tokens.push(t);
                }
            } 
            if(result.e) {
                console.log(result.e);
                break;
            }
        }
        console.log(tokens);
        return tokens; 
    }
    longestMatch(blob: string, lineNum: number): {t: Token[]|null, e:string|null} {

        if(TokenRegex.While.test(blob)){
            return {t:[new Token(TokenType.While, blob, lineNum)], e: null};
        } else if(TokenRegex.Print.test(blob)) {
            return {t:[new Token(TokenType.Print, blob, lineNum)], e:null};
        } else if(TokenRegex.EOP.test(blob)) {
            return {t:[new Token(TokenType.EOP, blob, lineNum)], e:null};
        } else if (TokenRegex.VarType.test(blob)) {
            return {t:[new Token(TokenType.VarType, blob, lineNum)], e:null};
        } else if (TokenRegex.If.test(blob)){
            return {t:[new Token(TokenType.If, blob, lineNum)], e:null};
        } else if (TokenRegex.BoolLiteral.test(blob)) {
            return {t:[new Token(TokenType.BoolLiteral, blob, lineNum)], e:null};
        } else if (TokenRegex.Id.test(blob)) {
            return {t:[new Token(TokenType.Id, blob, lineNum)], e:null};
        } else if (TokenRegex.Quote.test(blob)) {
            let splitQuote = blob.split("")
            console.log(blob);
            console.log(splitQuote);
            let tokenArray = [];
            for(let char of splitQuote) {
                if(char === "\""){
                    tokenArray.push(new Token(TokenType.Quote, char, lineNum));
                } else if (char.match(/[a-z]/g)) {
                    tokenArray.push(new Token(TokenType.Char, char, lineNum));
                } else {
                    return {t:tokenArray, e:"Unknown lexeme "+char+" on "+lineNum};
                }
            }
            return {t:tokenArray, e:null};
        } else if (TokenRegex.LBracket.test(blob)) {
            return {t:[new Token(TokenType.LBracket, blob, lineNum)], e:null};
        } else if (TokenRegex.RBracket.test(blob)) {
            return {t:[new Token(TokenType.RBracket, blob, lineNum)], e:null};
        } //Handle the case of no match by breaking on keywords

        return {t: null, e:"errormsg"}
        
    }

}
