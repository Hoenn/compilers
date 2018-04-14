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
    },
    {
        "test": `
            {
                int a int b int c int d int e int f int g int h int i int j int k
                int l int m int n int o int p int q int r int s int t int u int v 
                int w int x int y int z
                {
                    int a int b int c int d int e int f int g int h int i int j int k
                    int l int m int n int o int p 
                }
            }$`,
        "describe": "Nearly out of memory",
        "result": "A9 00 8D D5 00 A9 00 8D D6 00 A9 00 8D D7 00 A9 00 8D D8 00 A9 00 8D D9 00 A9 00 8D DA 00 A9 00 8D DB 00 A9 00 8D DC 00 A9 00 8D DD 00 A9 00 8D DE 00 A9 00 8D DF 00 A9 00 8D E0 00 A9 00 8D E1 00 A9 00 8D E2 00 A9 00 8D E3 00 A9 00 8D E4 00 A9 00 8D E5 00 A9 00 8D E6 00 A9 00 8D E7 00 A9 00 8D E8 00 A9 00 8D E9 00 A9 00 8D EA 00 A9 00 8D EB 00 A9 00 8D EC 00 A9 00 8D ED 00 A9 00 8D EE 00 A9 00 8D EF 00 A9 00 8D F0 00 A9 00 8D F1 00 A9 00 8D F2 00 A9 00 8D F3 00 A9 00 8D F4 00 A9 00 8D F5 00 A9 00 8D F6 00 A9 00 8D F7 00 A9 00 8D F8 00 A9 00 8D F9 00 A9 00 8D FA 00 A9 00 8D FB 00 A9 00 8D FC 00 A9 00 8D FD 00 A9 00 8D FE 00 00",
        "error": undefined
    },
    {
        "test": `
            {
                int a int b int c int d int e int f int g int h int i int j int k
                int l int m int n int o int p int q int r int s int t int u int v 
                int w int x int y int z
                {
                    int a int b int c int d int e int f int g int h int i int j int k
                    int l int m int n int o int p int q
                }
            }$`,
        "describe": "Out of memory",
        "result": undefined,
        "error": Generator.outOfMemory()
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
        if(result.mCode && test.result) {
            it(test.describe, () => {
                expect(result.mCode.toString()).to.deep.equal(test.result.split(" ").toString());
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