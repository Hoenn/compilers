import { Parser } from '../src/Parser';
import { Lexer } from '../src/Lexer';
import { SyntaxTree, Node } from '../src/SyntaxTree';
import {error} from '../src/Alert';
import { expect } from 'chai';
import 'mocha';

var Lex = new Lexer();

const tests = [
    {
        "test": "{}$",
        "describe": "Parse empty statement",
        "result": 
            B("Program", 0)+
             B("Block", 1)+
              L("LBracket", 2)+
              L("StatementList", 2)+
              L("RBracket", 2)+
             L("EOP", 1),
        "error": {lvl: null, msg: null} 
    },
    {
        "test": "{$",
        "describe": "Incomplete Block",
        "result": null,
        "error": {lvl: "error", msg: "Expected RBracket got EOP on line 1"}
    },
    {
        "test": "{print()}$",
        "describe": "Parse empty print statement",
        "result": null,
            
        "error": {lvl: "error", msg: "Expected Int|Boolean|String expression or Id "+
                "got RParen on line 1"} 
    },
    {
        "test": "{print(1)}$",
        "describe": "Parse print(digit) statement",
        "result":
            B("Program", 0)+
             B("Block", 1)+
               L("LBracket", 2)+
               B("StatementList", 2)+
                B("Statement", 3)+
                 B("PrintStatement", 4)+
                  L("Print", 5)+
                  L("LParen", 5)+
                  B("Expression", 5)+
                   B("IntExpr", 6)+
                    L("Digit", 7)+
                  L("RParen", 5)+
              L("RBracket", 2)+
             L("EOP", 1),
        "error": {lvl: null, msg: null} 
    },
    {
        "test": "{}{}$",
        "describe": "Parse Invalid Second Top Level block",
        "result": null,
        "error": error("Expected EOP got LBracket on line 1")

    }
];

tests.forEach(function(test) {
    describe('Parse: '+test.test, () => {
        const tokens = Lex.lex(test.test).t;
        let P = new Parser(tokens);
        const result = P.parse();
        //If cst is not null (no errors)
        if(result.cst) {
            //Test Parse output
            it(test.describe, ()=> {
                expect(result.cst.toString()).to.deep.equal(test.result);
            });
        }
        //Optional Error test
        if(test.error.lvl || test.error.msg){
            it('Should report: '+test.error.lvl+': '+test.error.msg, () => {
                expect(result.e).to.deep.equal(test.error);
            });
       }
    });
});

function B(name: string, depth: number): string {
    return "-".repeat(depth)+"<"+name+">\n";
}
function L(name: string, depth: number): string {
    return "-".repeat(depth)+"["+name+"]\n";
}