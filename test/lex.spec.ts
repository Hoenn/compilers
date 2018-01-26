import { Lexer } from '../src/Lexer'
import  {Token, TokenType} from '../src/Token'
import { expect } from 'chai';
import 'mocha';
var L = new Lexer();

const tests = [
    { 
        "test": "{}$",
        "result": [
            new Token(TokenType.LBracket, "{", 0),
            new Token(TokenType.RBracket, "}", 0),
            new Token(TokenType.EOP, "$", 0)
        ]
    },
    {
        "test": "{{{{{}}}}}}$",
        "result": [
            new Token(TokenType.LBracket, "{", 0),
            new Token(TokenType.LBracket, "{", 0),
            new Token(TokenType.LBracket, "{", 0),
            new Token(TokenType.LBracket, "{", 0),
            new Token(TokenType.LBracket, "{", 0),
            new Token(TokenType.RBracket, "}", 0),
            new Token(TokenType.RBracket, "}", 0),
            new Token(TokenType.RBracket, "}", 0),
            new Token(TokenType.RBracket, "}", 0),
            new Token(TokenType.RBracket, "}", 0),
            new Token(TokenType.RBracket, "}", 0),
            new Token(TokenType.EOP, "$", 0)
        ]
    },
    {
        "test": "{{{{{{}}} /* comments are ignored */ }}}}$",
        "result": [
            new Token(TokenType.LBracket, "{", 0),
            new Token(TokenType.LBracket, "{", 0),
            new Token(TokenType.LBracket, "{", 0),
            new Token(TokenType.LBracket, "{", 0),
            new Token(TokenType.LBracket, "{", 0),
            new Token(TokenType.LBracket, "{", 0),
            new Token(TokenType.RBracket, "}", 0),
            new Token(TokenType.RBracket, "}", 0),
            new Token(TokenType.RBracket, "}", 0),
            new Token(TokenType.RBracket, "}", 0),
            new Token(TokenType.RBracket, "}", 0),
            new Token(TokenType.RBracket, "}", 0),
            new Token(TokenType.RBracket, "}", 0),
            new Token(TokenType.EOP, "$", 0)
        ]
    },
    {
        "test": "{ /*comments are still ignored */ int @}$",
        "result": [
            new Token(TokenType.LBracket, "{", 0),
            new Token(TokenType.IntType, "int", 0),
            //Error on the @ symbol
            new Token(TokenType.RBracket, "}", 0),
            new Token(TokenType.EOP, "$", 0)
        ]
    }

]
describe('Lex: '+tests[0].test, () => {
    it('should have '+tests[0].test+' as separate tokens', () => {
        const result = L.lex(tests[0].test)
        expect(result).to.deep.equal(tests[0].result);
    });
});
describe('Lex: '+tests[1].test, () => {
    it('should have '+tests[1].test+' as separate tokens', () => {
        const result = L.lex(tests[1].test)
        expect(result).to.deep.equal(tests[1].result);
    });
});
describe('Lex: '+tests[2].test, () => {
    it('should have '+tests[2].test+' as separate tokens', () => {
        const result = L.lex(tests[2].test)
        expect(result).to.deep.equal(tests[2].result);
    });
});
// describe('Lex: '+tests[3].test, () => {
//     it('should have '+tests[3].test+' as separate tokens', () => {
//         //Result should be a pair with an error
//         const result = L.lex(tests[3].test)
//         //result should be equal but the error containing "Error: Unrecognized Token:@" 
//         //should also be in the val,-error-
//         expect(result).to.deep.equal(tests[3].result);
//     });
// });