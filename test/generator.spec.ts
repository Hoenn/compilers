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
        "result": zeroOutHelper([]),
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
        "result": "A9,00,8D,D5,00,A9,00,8D,D6,00,A9,00,8D,D7,00,A9,00,8D,D8,00,A9,00,8D,D9,00,A9,00,8D,DA,00,A9,00,8D,DB,00,A9,00,8D,DC,00,A9,00,8D,DD,00,A9,00,8D,DE,00,A9,00,8D,DF,00,A9,00,8D,E0,00,A9,00,8D,E1,00,A9,00,8D,E2,00,A9,00,8D,E3,00,A9,00,8D,E4,00,A9,00,8D,E5,00,A9,00,8D,E6,00,A9,00,8D,E7,00,A9,00,8D,E8,00,A9,00,8D,E9,00,A9,00,8D,EA,00,A9,00,8D,EB,00,A9,00,8D,EC,00,A9,00,8D,ED,00,A9,00,8D,EE,00,A9,00,8D,EF,00,A9,00,8D,F0,00,A9,00,8D,F1,00,A9,00,8D,F2,00,A9,00,8D,F3,00,A9,00,8D,F4,00,A9,00,8D,F5,00,A9,00,8D,F6,00,A9,00,8D,F7,00,A9,00,8D,F8,00,A9,00,8D,F9,00,A9,00,8D,FA,00,A9,00,8D,FB,00,A9,00,8D,FC,00,A9,00,8D,FD,00,A9,00,8D,FE,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00",
        "error": undefined
    },
    {
        "test": `
            {
                print((2 == 1 + 1))
            }$`,
        "describe": "Addition nested in boolean operation",
        "result": "A9,02,8D,36,00,A9,01,8D,35,00,A9,01,6D,35,00,8D,35,00,AE,36,00,EC,35,00,A9,00,D0,02,A9,01,A2,01,A0,2F,D0,02,A0,2A,A2,02,FF,00,74,72,75,65,00,66,61,6C,73,65,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00",
        "error": undefined 

    },
    {
        "test": `
            {
                int a
                int b
                b = 3
                a = 1 + 2 + b
                print(4 + a)
            }$`,
        "describe": "Plus assignment, int, var addition inside print",
        "result": "A9,00,8D,3C,00,A9,00,8D,3D,00,A9,03,8D,3D,00,AD,3D,00,8D,3A,00,A9,02,6D,3A,00,8D,3A,00,A9,01,6D,3A,00,8D,3C,00,AD,3C,00,8D,3A,00,A9,04,6D,3A,00,A2,01,8D,3A,00,AC,3A,00,FF,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00",
        "error": undefined
    },
    {
        "test": `
            {
                int a
                a = 0
                while (a ==0) {
                    print(a)
                }
            }$`,
        "describe": "Infinite printing loop using ==",
        'result': "A9,00,8D,38,00,A9,00,8D,38,00,AD,38,00,8D,37,00,A9,00,8D,36,00,AE,37,00,EC,36,00,A9,00,D0,02,A9,01,D0,12,AC,38,00,A2,01,FF,A9,00,8D,36,00,A2,01,EC,36,00,D0,D5,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00",
        "error": undefined
    },
    {
        "test": `
            {
                int a
                a = 0
                while (a == 0) {
                    a = 1 + a
                    print(a)
                }
            }$`,
        "describe": "Break out of loop from inisde",
        "result": "A9,00,8D,46,00,A9,00,8D,46,00,AD,46,00,8D,45,00,A9,00,8D,44,00,AE,45,00,EC,44,00,A9,00,D0,02,A9,01,D0,20,AD,46,00,8D,44,00,A9,01,6D,44,00,8D,46,00,AC,46,00,A2,01,FF,A9,00,8D,44,00,A2,01,EC,44,00,D0,C7,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00",
        "error": undefined
    },
    {
        "test": `
            {
                string a
                a = "hello"
                {
                    a = "world"
                    print(a)
                }
            }`,
        "describe": "Reassign string in child scope",
        "result": "A9,00,8D,18,00,A9,FA,8D,18,00,A9,F4,8D,18,00,AC,18,00,A2,02,FF,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,77,6F,72,6C,64,00,68,65,6C,6C,6F,00",
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

function zeroOutHelper(arr: string[]) {
    for(let i = 0; i < 256; i++) {
        if(arr[i] == undefined) {
            arr[i] = "00";
        }
    }
}