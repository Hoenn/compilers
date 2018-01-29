import {Token, TokenRegex, TokenType} from './Token';
import { join } from 'path';
export class Lexer {

    lex(src: string): {t:Token[]|null, e:string|null} {
        //Break text into blobs to perform longest match on
        //filter out undefined blobs
        let tokenBlobs = src.split(TokenRegex.Split).filter((defined) => defined);
        let lineNum = 1;
        console.log(tokenBlobs);
        let tokens: Token[] = [];
        let result: {t:Token[]|null, e: string|null} = {t:null, e:null}
        for(let blob of tokenBlobs) {
            //If newline is found increment lineNum but skip
            //If a comment or whitespace just skip
            if(blob.match("\n")) {
                lineNum += 1;
                continue;
            } else if (blob.match(TokenRegex.Comment) || blob.match(TokenRegex.WhiteSpace)){
                continue;
            }
            result = this.longestMatch(blob, lineNum);
            if(result.t) { //is not null
                for(let t of result.t){
                    tokens.push(t);
                }
            } 
            //It's possible to have valid tokens returned along with an error
            if(result.e) {
                console.log(result.e);
                break;
            }
        }
        console.log(tokens);
        return {t:tokens, e:result.e}; 
    }

    longestMatch(blob: string, lineNum: number): {t: Token[]|null, e:string|null} {
        //Test the blob for each allowed token
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
            //Break "quoted" blob into characters
            let splitQuote = blob.split("")
            let tokenArray = [];
            for(let char of splitQuote) {
                //If it's a quote simply add that token
                if(char === "\""){
                    tokenArray.push(new Token(TokenType.Quote, char, lineNum));
                } else if (char.match(/[a-z]/g)||char.match(TokenRegex.whitespace)) {
                    //If it's a letter add that token
                    tokenArray.push(new Token(TokenType.Char, char, lineNum));
                } else {
                    //"quoted" may only contain valid lexemes (chars)
                    return {t:tokenArray, e:this.lexErrorMessage(char, lineNum)};
                }
            }
            return {t:tokenArray, e:null};
        } else if (TokenRegex.Integer.test(blob)){
            return {t:[new Token(TokenType.Integer, blob, lineNum)], e:null};
        } else if (TokenRegex.BoolOp.test(blob)) {
            return {t:[new Token(TokenType.BoolOp, blob, lineNum)], e:null};
        } else if (TokenRegex.LParen.test(blob)) {
            return {t:[new Token(TokenType.LParen, blob, lineNum)], e:null};
        } else if (TokenRegex.RParen.test(blob)) {
            return {t:[new Token(TokenType.RParen, blob, lineNum)], e:null};
        } else if (TokenRegex.LBracket.test(blob)) {
            return {t:[new Token(TokenType.LBracket, blob, lineNum)], e:null};
        } else if (TokenRegex.RBracket.test(blob)) {
            return {t:[new Token(TokenType.RBracket, blob, lineNum)], e:null};
        } else {
            //Blob did not match any valid tokens, but may contain valid tokens
            //ex: intx -> [int, x]
            //Check match for keywords
            if (blob.match(TokenRegex.Keywords)) {
                //If there are keywords, split string by them and longest match the result
                let splitBlob = blob.split(TokenRegex.Keywords)
                    .filter((def)=>def);

                let tokenArray = [];
                let errorMsg:string|null = null;

                for(let b of splitBlob) {
                    //Longest match on new string
                    let result = this.longestMatch(b, lineNum);
                    //If there is no error, keep this token and proceed
                    if(result.e == null && result.t) {
                        for(let t of result.t) {
                            tokenArray.push(t);
                        }
                    } else { //If there was an error, return it and preceding tokens
                        errorMsg = result.e;
                        break;
                    }
                }
                return {t:tokenArray, e: errorMsg};
            } else {
                //If the blob doesn't contain any keywords and reached here it must not be valid
                return {t: null, e: this.lexErrorMessage(blob, lineNum)};
            }
        }
        
    }

    lexErrorMessage(blob: string, lineNum: number):string {
        return "Unknown token "+blob.trim()+" on line "+lineNum;
    }

}
