import {Token, TokenRegex, TokenType} from './Token';
import { join } from 'path';

type Error = {lvl: string, msg: string}

export class Lexer {

    lex(src: string): {t:Token[]|null, e:Error|null} {
        //Break text into blobs to perform longest match on
        //filter out undefined blobs
        let tokenBlobs = src.split(TokenRegex.Split).filter((defined) => defined);
        let lineNum = 1;
        console.log(tokenBlobs);
        let tokens: Token[] = [];
        let result: {t:Token[]|null, e: Error|null} = {t:null, e:null}
        for(let blob of tokenBlobs) {
            //If a comment or whitespace just skip
            if (blob.match(TokenRegex.Comment) || blob.match(TokenRegex.WhiteSpace)){
            //If newline is found increment lineNum but skip
                if (blob.match("\n")) {
                    lineNum+=1;
                }
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
        //If we have no errors, check if EOP is missing. No need if there are other lex errors
        if(result.e === null) {
            if(tokens.length == 0  || tokens[tokens.length-1].kind != TokenType.EOP) {
                tokens.push(new Token(TokenType.EOP, "$", lineNum));
                result.e = this.warning("End of Program missing. Added $ symbol.");
            }
        }
        console.log(tokens);
        return {t:tokens, e:result.e}; 
    }

    longestMatch(blob: string, lineNum: number): {t: Token[]|null, e: Error | null} {
        if (TokenRegex.Quote.test(blob)) {
            //Break "quoted" blob into characters after removing comments
            let noComment = blob.replace(/\/\*.*\*\//g, "");
            let splitQuote = noComment.split("");
            let tokenArray = [];
            for(let char of splitQuote) {
                //If it's a quote simply add that token
                if(char === "\""){
                    tokenArray.push(new Token(TokenType.Quote, char, lineNum));
                } else if (char.match(/[a-z]/) || char.match(/\s/)) {
                    //If it's a new line, accurately report it
                    if(char.match("\n")){
                        return {t:tokenArray, e:this.error("[\n]", lineNum)};
                    }
                    //If it's a letter or space add that token
                    tokenArray.push(new Token(TokenType.Char, char, lineNum));
                } else {
                    //"quoted" may only contain valid lexemes (chars)
                    return {t:tokenArray, e: this.error(char, lineNum)};
                }
            }
            return {t:tokenArray, e:null};
        } else if(TokenRegex.While.test(blob)){
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
        }  else if (TokenRegex.Digit.test(blob)){
            return {t:[new Token(TokenType.Digit, blob, lineNum)], e:null};
        } else if (TokenRegex.Assign.test(blob)) {
            return {t:[new Token(TokenType.Assign, blob, lineNum)], e:null};
        } else if (TokenRegex.IntOp.test(blob)) {
            return {t:[new Token(TokenType.IntOp, blob, lineNum)], e:null};
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
                let result: {t: Token[]|null, e: Error | null}  = {t: null, e: null}
                for(let b of splitBlob) {
                    //Longest match on new string
                    let result = this.longestMatch(b, lineNum);
                    //If there is no error, keep this token and proceed
                    if(result.t) {
                        for(let t of result.t) {
                            tokenArray.push(t);
                        }
                    } else { //If there was an error, return it and preceding tokens
                        break;
                    }
                }
                return {t:tokenArray, e: result.e};
            } else {
				console.log(blob);
                //If the blob doesn't contain any keywords and reached here it must not be valid
                return {t: null, e: this.error(blob, lineNum)};
            }
        }
        
    }

    error(blob: string, lineNum: number):Error {
        return {lvl: "error", msg:"Unknown token "+blob.trim()+" on line "+lineNum};
    }


    warning(m: string) : Error {
        return {lvl: "warning", msg: m};
    }

}
