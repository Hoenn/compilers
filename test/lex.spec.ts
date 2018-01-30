import { Lexer } from '../src/Lexer'
import  {Token, TokenType} from '../src/Token'
import { expect } from 'chai';
import 'mocha';
var L = new Lexer();

const tests = [
    { 
        "test": "{}$",
        "result": [
            new Token(TokenType.LBracket, "{", 1),
            new Token(TokenType.RBracket, "}", 1),
            new Token(TokenType.EOP, "$", 1)
        ],
        "error": null
    },
    {
        "test": "{{{{{}}}}}}$",
        "result": [
            new Token(TokenType.LBracket, "{", 1),
            new Token(TokenType.LBracket, "{", 1),
            new Token(TokenType.LBracket, "{", 1),
            new Token(TokenType.LBracket, "{", 1),
            new Token(TokenType.LBracket, "{", 1),
            new Token(TokenType.RBracket, "}", 1),
            new Token(TokenType.RBracket, "}", 1),
            new Token(TokenType.RBracket, "}", 1),
            new Token(TokenType.RBracket, "}", 1),
            new Token(TokenType.RBracket, "}", 1),
            new Token(TokenType.RBracket, "}", 1),
            new Token(TokenType.EOP, "$", 1)
        ],
        "error": null

    },
    {
        "test": "{{{{{{}}} /* comments are ignored */ }}}}$",
        "result": [
            new Token(TokenType.LBracket, "{", 1),
            new Token(TokenType.LBracket, "{", 1),
            new Token(TokenType.LBracket, "{", 1),
            new Token(TokenType.LBracket, "{", 1),
            new Token(TokenType.LBracket, "{", 1),
            new Token(TokenType.LBracket, "{", 1),
            new Token(TokenType.RBracket, "}", 1),
            new Token(TokenType.RBracket, "}", 1),
            new Token(TokenType.RBracket, "}", 1),
            new Token(TokenType.RBracket, "}", 1),
            new Token(TokenType.RBracket, "}", 1),
            new Token(TokenType.RBracket, "}", 1),
            new Token(TokenType.RBracket, "}", 1),
            new Token(TokenType.EOP, "$", 1)
        ],
        "error": null

    },
    {
        "test": "{ /*comments are still ignored */ int @}$",
        "result": [
            new Token(TokenType.LBracket, "{", 1),
            new Token(TokenType.VarType, "int", 1),
        ],
        "error": L.lexErrorMessage("@", 1)
    },
    {
        "test": "{}${}$",
        "result": [
            new Token(TokenType.LBracket, "{", 1),
            new Token(TokenType.RBracket, "}", 1),
            new Token(TokenType.EOP, "$", 1),
            new Token(TokenType.LBracket, "{", 1),
            new Token(TokenType.RBracket, "}", 1),
            new Token(TokenType.EOP, "$", 1),
        ],
        "error": null

    },
    {
        "test": "{\n\"abc\"\n}",
        "result": [
            new Token(TokenType.LBracket, "{", 1),
            new Token(TokenType.Quote, "\"", 2),
            new Token(TokenType.Char, "a", 2),
            new Token(TokenType.Char, "b", 2),
            new Token(TokenType.Char, "c", 2),
            new Token(TokenType.Quote, "\"", 2),
            new Token(TokenType.RBracket, "}", 3)
        ],
        "error": null

    },
    {
        "test": "{intx}",
        "result": [
            new Token(TokenType.LBracket, "{", 1),
            new Token(TokenType.VarType, "int", 1),
            new Token(TokenType.Id, "x", 1),
            new Token(TokenType.RBracket, "}", 1)
        ],
        "error": null
    },
    {
        "test": '"ab!c"',
        "result": [
            new Token(TokenType.Quote, '"', 1),
            new Token(TokenType.Char, "a", 1),
            new Token(TokenType.Char, "b", 1),
        ],
        "error": L.lexErrorMessage("!", 1)
    },
    {
        "test": '"a/*b*/c"',
        "result": [
            new Token(TokenType.Quote, '"', 1),
            new Token(TokenType.Char, "a", 1),
            new Token(TokenType.Char, "c", 1),
        new Token(TokenType.Quote, '"', 1)
        ],
        "error": null

    },
    {
        "test": "1a23b",
        "result": [
            new Token(TokenType.Digit, "1", 1),
            new Token(TokenType.Id, "a", 1),
            new Token(TokenType.Digit, "2", 1),
            new Token(TokenType.Digit, "3", 1),
            new Token(TokenType.Id, "b", 1)
        ],
        "error": null
    }

]
describe('Lex: '+tests[0].test, () => {
    it('should have '+tests[0].test+' as separate tokens', () => {
        const result = L.lex(tests[0].test).t
        expect(result).to.deep.equal(tests[0].result);
    });
});
describe('Lex: '+tests[1].test, () => {
    it('should have '+tests[1].test+' as separate tokens', () => {
        const result = L.lex(tests[1].test).t
        expect(result).to.deep.equal(tests[1].result);
    });
});
describe('Lex: '+tests[2].test, () => {
    it('should have '+tests[2].test+' as separate tokens', () => {
        const result = L.lex(tests[2].test).t
        expect(result).to.deep.equal(tests[2].result);
    });
});
describe('Lex: '+tests[3].test, () => {

    const tokensWithError = L.lex(tests[3].test)
    it('should have '+tests[3].test+' as separate tokens', () => {
        const result = tokensWithError.t;

        expect(result).to.deep.equal(tests[3].result);
    })
    it('should report '+tests[3].error, () => {
        const error = tokensWithError.e;
        expect(error).to.equal(tests[3].error);
    })
});
describe('Lex: '+tests[4].test, () => {
    it('should have '+tests[4].test+' as separate tokens', () => {
        const result = L.lex(tests[4].test).t
        expect(result).to.deep.equal(tests[4].result);
    });
});
describe('Lex: '+tests[5].test, () => {
    it('should have '+tests[5].test+' as separate tokens', () => {
        const result = L.lex(tests[5].test).t
        expect(result).to.deep.equal(tests[5].result);
    });
});
describe('Lex: '+tests[6].test, () => {
    it('should have '+tests[6].test+' as separate tokens', () => {
        const result = L.lex(tests[6].test).t
        expect(result).to.deep.equal(tests[6].result);
    });
});
describe('Lex: '+tests[7].test, () => {
    it('should have '+tests[7].test+' as separate tokens', () => {
        const result = L.lex(tests[7].test).t
        expect(result).to.deep.equal(tests[7].result);
    });
});
describe('Lex: '+tests[8].test, () => {
    it('should have '+tests[8].test+' as separate tokens', () => {
        const result = L.lex(tests[8].test).t
        expect(result).to.deep.equal(tests[8].result);
    });
});
describe('Lex: '+tests[9].test, () => {
    it('should have '+tests[9].test+' as separate tokens', () => {
        const result = L.lex(tests[9].test).t
        expect(result).to.deep.equal(tests[9].result);
    });
});
