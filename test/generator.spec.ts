import { Parser } from "../src/Parser";
import { Lexer } from "../src/Lexer";
import { SemanticAnalyzer } from "../src/SemanticAnalyzer";
import { Generator } from "../src/Generator";
import { error, Alert } from "../src/Alert";
import { expect } from "chai";
import "mocha";

const tests = [
    {
        "test": "{}$",
        "describe": "Empty program",
        "result": "00",
        "error": undefined
    }
]

const Lex = new Lexer();
tests.forEach(function(test) {
    describe("Generate: "+test.test +": "+test.describe, () =>{
        let tokens = Lex.lex(test.test).t;
        let P = new Parser(tokens);
        let parse = P.parse();
        let SA = new SemanticAnalyzer(parse.ast);
        let semantic = SA.analyze();
        let G = new Generator(semantic.ast, semantic.st);
        let result = G.generate();
        if(result.mCode) {
            it(test.describe, () => {
                expect(result.mCode.toString()).to.deep.equal(test.result);
            })
        }
        if(test.error || result.error) {
            if(!test.error && result.error) {
                it('Result reported: '+result.error.lvl+": "+result.error.msg, () => {
                    throw new Error("Resulting error undefined in test.error");
                });
            } else if (test.error && !result.error) {
                it('Did not report expected error '+test.error.lvl+": "+test.error.msg, () => {
                    throw new Error("Error defined in test.error but not found in result");
                });
            } else {
                it('Should report: '+test.error.lvl+': '+test.error.msg, () => {
                    expect(result.error).to.deep.equal(test.error);
                });
            }
        } else {
            it('Should report: no errors', () => {
                expect(result.error).to.deep.equal(undefined);
            })
        }

    });
});