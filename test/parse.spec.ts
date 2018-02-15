import { Parser } from '../src/Parser';
import { Lexer } from '../src/Lexer';
import { SyntaxTree, Node } from '../src/SyntaxTree';
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
        "error": undefined
    }

];
describe('Running Parse Tests', () => {
    //Dummy test needed before we can loop tests
    it('Tests Complete', function(done){
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
                if(test.error){
                    it('Should report: '+test.error, () => {
                        expect(result.e).to.deep.equal(test.error);
                    });
                }
            });
        });
        //Required for async testing loop
        done();
    });
});

function add(name: string, depth: number): string {
    return "-".repeat(depth)+"<"+name+">\n";
}
function addLeaf(name: string, depth: number): string {
    return "-".repeat(depth)+"["+name+"]\n";
}