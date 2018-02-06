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
        "error": {lvl:null, msg:null}
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
        "error": {lvl:null, msg:null}

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
        "error": {lvl:null, msg:null}

    },
    {
        "test": "{ /*comments are still ignored */ int @}$",
        "describe": "Generate valid tokens until invalid '@' is found",
        "result": [
            new Token(TokenType.LBracket, "{", 1),
            new Token(TokenType.VarType, "int", 1),
        ],
        "error": L.error("@", 1)
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
        "error": {lvl:null, msg:null}
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
        "error": {lvl:null, msg:null}
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
        "error": {lvl:null, msg:null}
    },
    {
        "test": '"ab!c"$',
        "describe": "Generate error for invalid character within quotes",
        "result": [
            new Token(TokenType.Quote, '"', 1),
            new Token(TokenType.Char, "a", 1),
            new Token(TokenType.Char, "b", 1),
        ],
        "error": L.error("!", 1)
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
        "error": {lvl:null, msg:null}

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
        "error": {lvl:null, msg:null}
    },
    {
        "test": "{}",
        "describe": "Show warning for missing EOP and correctly add it",
        "result": [
            new Token(TokenType.LBracket, "{", 1),
            new Token(TokenType.RBracket, "}", 1),
            new Token(TokenType.EOP, "$", 1)
        ],
        "error": L.warning("End of Program missing. Added $ symbol.")
    },
    {
        "test": "{\t x\t \r \f \t }$",
        "describe": "Ignore mixed whitespace characters",
        "result": [
            new Token(TokenType.LBracket, "{", 1),
            new Token(TokenType.Id, "x", 1),
            new Token(TokenType.RBracket, "}", 1),
            new Token(TokenType.EOP, "$", 1)
        ],
        "error": {lvl:null, msg:null}
    },
    {
        "test": "a = 1+ c$",
        "describe": "Lex addition",
        "result": [
            new Token(TokenType.Id, "a", 1),
            new Token(TokenType.Assign, "=", 1),
            new Token(TokenType.Digit, "1", 1),
            new Token(TokenType.IntOp, "+", 1),
            new Token(TokenType.Id, "c", 1),
            new Token(TokenType.EOP, "$", 1)
        ],
        "error": {lvl: null, msg:null}

    }

]

describe('Running Tests', () => {
    //Dummy test needed before we can loop tests
    it('Tests Complete', function(done){
        tests.forEach(function(test) {
            describe('Lex: '+test.test, () => {
                const result = L.lex(test.test);
                //Test Token output
                it(test.describe, ()=> {
                    expect(result.t).to.deep.equal(test.result);
                });
                //Optional Error test
                if(test.error.lvl || test.error.msg){
                    it('Should report: '+test.error.lvl+': '+test.error.msg, () => {
                        expect(result.e).to.deep.equal(test.error);
                    });
                }
            });
        });
        //Required for async testing loop
        done();
    });
});