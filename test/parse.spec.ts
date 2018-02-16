import { Parser } from '../src/Parser';
import { Lexer } from '../src/Lexer';
import { SyntaxTree, Node } from '../src/SyntaxTree';
import {error} from '../src/Alert';
import { expect } from 'chai';
import 'mocha';

var L = new Lexer();

const tests = [
    {
        "test": "{}$",
        "describe": "Parse empty statement",
        "result": 
            add("Program", 0)+
             add("Block", 1)+
              addLeaf("LBracket", 2)+
              add("StatementList", 2)+
               addLeaf("Statement", 3)+
              addLeaf("RBracket", 2)+
             addLeaf("EOP", 1),
        "error": {lvl: null, msg: null} 
    },
    {
        "test": "{$",
        "describe": "Incomplete Block",
        "result":
            add("Program", 0)+
             add("Block", 1)+
              addLeaf("LBracket", 2)+
              add("StatementList",2)+
               addLeaf("Statement", 3),
        "error": {lvl: "error", msg: "Expected RBracket got EOP on line 1"}
    },
    {
        "test": "{print()}$",
        "describe": "Parse empty print statement",
        "result":
            add("Program", 0)+
             add("Block", 1)+
               addLeaf("LBracket", 2)+
               add("StatementList", 2)+
                add("Statement", 3)+
                 add("PrintStatement", 4)+
                  addLeaf("Print", 5)+
                  addLeaf("LParen", 5)+
                  addLeaf("RParen", 5)+
              addLeaf("RBracket", 2)+
             addLeaf("EOP", 1),
        "error": {lvl: null, msg: null} 
    },
    {
        "test": "{}{}$",
        "describe": "Parse Invalid Second Top Level block",
        "result": 
            add("Program", 0)+
             add("Block", 1)+
              addLeaf("LBracket", 2)+
              add("StatementList", 2)+
               addLeaf("Statement", 3)+
              addLeaf("RBracket", 2),
        "error": error("Expected EOP got LBracket on line 1")

    }


];

tests.forEach(function(test) {
    describe('Parse: '+test.test, () => {
        const tokens = L.lex(test.test).t;
        let P = new Parser(tokens);
        const result = P.parse();
        //Test Parse output
        it(test.describe, ()=> {
            expect(result.cst.toString()).to.deep.equal(test.result);
        });
        //Optional Error test
        if(test.error.lvl || test.error.msg){
            it('Should report: '+test.error.lvl+': '+test.error.msg, () => {
                expect(result.e).to.deep.equal(test.error);
            });
       }
    });
});

function add(name: string, depth: number): string {
    return "-".repeat(depth)+"<"+name+">\n";
}
function addLeaf(name: string, depth: number): string {
    return "-".repeat(depth)+"["+name+"]\n";
}