import { Lexer } from '../src/Lexer'
import  {Token, TokenType} from '../src/Token'
import { expect } from 'chai';
import 'mocha';
var L = new Lexer();

const tests = [
    { 
        "test": "{}$",
        "describe": "Generate tokens for {}$",
        "result": [
            new Token(TokenType.LBracket, "{", 1),
            new Token(TokenType.RBracket, "}", 1),
            new Token(TokenType.EOP, "$", 1)
        ],
        "error": null
    },
    {
        "test": "{{{{{}}}}}}$",
        "describe": "Generate tokens for {{{{{}}}}}}$",
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
        "describe": "Generate tokens, ignore comments",
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
        "describe": "Generate valid tokens until invalid '@' is found",
        "result": [
            new Token(TokenType.LBracket, "{", 1),
            new Token(TokenType.VarType, "int", 1),
        ],
        "error": L.lexErrorMessage("@", 1)
    },
    {
        "test": "{}${}$",
        "describe": "Generate tokens even with multiple EOP",
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
        "test": "{\n\"abc\"\n}$",
        "describe": "Generate tokens from multiple lines saving line number",
        "result": [
            new Token(TokenType.LBracket, "{", 1),
            new Token(TokenType.Quote, "\"", 2),
            new Token(TokenType.Char, "a", 2),
            new Token(TokenType.Char, "b", 2),
            new Token(TokenType.Char, "c", 2),
            new Token(TokenType.Quote, "\"", 2),
            new Token(TokenType.RBracket, "}", 3),
            new Token(TokenType.EOP, "$", 3)
        ],
        "error": null

    },
    {
        "test": "{intx}$",
        "describe": "Generate tokens for no whitespace input",
        "result": [
            new Token(TokenType.LBracket, "{", 1),
            new Token(TokenType.VarType, "int", 1),
            new Token(TokenType.Id, "x", 1),
            new Token(TokenType.RBracket, "}", 1),
            new Token(TokenType.EOP, "$", 1)
        ],
        "error": null
    },
    {
        "test": '"ab!c"$',
        "describe": "Generate error for invalid character within quotes",
        "result": [
            new Token(TokenType.Quote, '"', 1),
            new Token(TokenType.Char, "a", 1),
            new Token(TokenType.Char, "b", 1),
        ],
        "error": L.lexErrorMessage("!", 1)
    },
    {
        "test": '"a/*b*/c"$',
        "describe": "Ignore comments within quotes",
        "result": [
            new Token(TokenType.Quote, '"', 1),
            new Token(TokenType.Char, "a", 1),
            new Token(TokenType.Char, "c", 1),
            new Token(TokenType.Quote, '"', 1),
            new Token(TokenType.EOP, "$", 1)
        ],
        "error": null

    },
    {
        "test": "1a23b$",
        "describe": "Correctly create separate digit tokens for '23'",
        "result": [
            new Token(TokenType.Digit, "1", 1),
            new Token(TokenType.Id, "a", 1),
            new Token(TokenType.Digit, "2", 1),
            new Token(TokenType.Digit, "3", 1),
            new Token(TokenType.Id, "b", 1),
            new Token(TokenType.EOP, "$", 1)
        ],
        "error": null
    },
    {
        "test": "{}",
        "describe": "Show warning for missing EOP and correctly add it",
        "result": [
            new Token(TokenType.LBracket, "{", 1),
            new Token(TokenType.RBracket, "}", 1),
            new Token(TokenType.EOP, "$", 1)
        ],
        "error": "Warning: End of Program missing. Added $ symbol"
    }

]
describe('Lex: '+tests[0].test, () => {
    it(tests[0].describe, () => {
        const result = L.lex(tests[0].test).t
        expect(result).to.deep.equal(tests[0].result);
    });
});
describe('Lex: '+tests[1].test, () => {
    it(tests[1].describe, () => {
        const result = L.lex(tests[1].test).t
        expect(result).to.deep.equal(tests[1].result);
    });
});
describe('Lex: '+tests[2].test, () => {
    it(tests[2].describe, () => {
        const result = L.lex(tests[2].test).t
        expect(result).to.deep.equal(tests[2].result);
    });
});
describe('Lex: '+tests[3].test, () => {

    const tokensWithError = L.lex(tests[3].test)
    it(tests[3].describe, () => {
        const result = tokensWithError.t;

        expect(result).to.deep.equal(tests[3].result);
    })
    it('should report '+tests[3].error, () => {
        const error = tokensWithError.e;
        expect(error).to.equal(tests[3].error);
    })
});
describe('Lex: '+tests[4].test, () => {
    it(tests[4].describe, () => {
        const result = L.lex(tests[4].test).t
        expect(result).to.deep.equal(tests[4].result);
    });
});
describe('Lex: '+tests[5].test, () => {
    it(tests[5].describe, () => {
        const result = L.lex(tests[5].test).t
        expect(result).to.deep.equal(tests[5].result);
    });
});
describe('Lex: '+tests[6].test, () => {
    it(tests[6].describe, () => {
        const result = L.lex(tests[6].test).t
        expect(result).to.deep.equal(tests[6].result);
    });
});
describe('Lex: '+tests[7].test, () => {
    it(tests[7].describe, () => {
        const result = L.lex(tests[7].test).t
        expect(result).to.deep.equal(tests[7].result);
    });
});
describe('Lex: '+tests[8].test, () => {
    it(tests[8].describe, () => {
        const result = L.lex(tests[8].test).t
        expect(result).to.deep.equal(tests[8].result);
    });
});
describe('Lex: '+tests[9].test, () => {
    it(tests[9].describe, () => {
        const result = L.lex(tests[9].test).t
        expect(result).to.deep.equal(tests[9].result);
    });
});
describe('Lex: '+tests[10].test, () => {
    it(tests[10].describe, () => {
        const result = L.lex(tests[10].test).t
        expect(result).to.deep.equal(tests[10].result);
    });
});