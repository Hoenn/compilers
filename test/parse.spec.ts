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
        "describe": "Parse empty block",
        "result": 
            B("Root", 0)+
             B("Program", 1)+
              B("Block", 2)+
               L("{", 3)+
               L("StatementList", 3)+
               L("}", 3)+
              L("$", 2),
        "ast":
            L("Block", 0),
        "error": {lvl: null, msg: null} 
    },
    {
        "test": "{}${}$",
        "describe": "Parse multiple programs",
        "result":
            B("Root", 0)+
             B("Program", 1)+
              B("Block", 2)+
               L("{", 3)+
               L("StatementList", 3)+
               L("}", 3)+
              L("$", 2)+
             B("Program", 1)+
              B("Block", 2)+
               L("{", 3)+
               L("StatementList", 3)+
               L("}", 3)+
              L("$", 2),
        "error": {lvl: null, msg:null}
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
            B("Root", 0)+
             B("Program", 1)+
              B("Block", 2)+
                L("{", 3)+
                B("StatementList", 3)+
                 B("Statement", 4)+
                  B("PrintStatement", 5)+
                   L("print", 6)+
                   L("(", 6)+
                   B("Expression", 6)+
                    B("IntExpr", 7)+
                     L("1", 8)+
                   L(")", 6)+
               L("}", 3)+
              L("$", 2),
        "ast":
            B("Block", 0)+
             B("Print", 1)+
              L("1", 2),
        "error": {lvl: null, msg: null} 
    },
    {
        "test": '{print("")}$',
        "describe": "Parse StringExpr with empty CharList",
        "result": 
            B("Root", 0)+
             B("Program", 1)+
              B("Block", 2)+
               L("{", 3)+
               B("StatementList", 3)+
                B("Statement", 4)+
                 B("PrintStatement", 5)+
                  L("print", 6)+
                  L("(", 6)+
                  B("Expression", 6)+
                   B("StringExpr", 7)+
                    L('"', 8)+
                    L("CharList", 8)+
                    L('"', 8)+
                  L(")", 6)+
               L("}", 3)+
              L("$", 2),
        "ast":
            B("Block", 0)+
             B("Print", 1)+
              L("", 2),
        "error": {lvl: null, msg: null}
    },
    {
        "test": '{print("a ")}$',
        "describe": "Parse StringExpr with char and space",
        "result": 
            B("Root", 0)+
             B("Program", 1)+
              B("Block", 2)+
               L("{", 3)+
               B("StatementList", 3)+
                B("Statement", 4)+
                 B("PrintStatement", 5)+
                  L("print", 6)+
                  L("(", 6)+
                  B("Expression", 6)+
                   B("StringExpr", 7)+
                    L('"', 8)+
                    B("CharList", 8)+
                     L("a", 9)+
                     B("CharList", 9)+
                      L(" ", 10)+
                      L("CharList", 10)+
                    L('"', 8)+
                  L(")", 6)+
               L("}", 3)+
              L("$", 2),
        "ast":
            B("Block", 0)+
             B("Print", 1)+
              L("a ", 2),
        "error": {lvl: null, msg: null}
    },
    {
        "test": '{if true{}}$',
        "describe": "Parse If Expression with bool literal",
        "result": 
            B("Root", 0)+
             B("Program", 1)+
              B("Block", 2)+
               L("{", 3)+
               B("StatementList", 3)+
                B("Statement", 4)+
                 B("IfStatement", 5)+
                  L("if", 6)+
                  B("BooleanExpr", 6)+
                   L("true", 7)+
                  B("Block", 6)+
                   L("{", 7)+
                   L("StatementList", 7)+
                   L("}", 7)+
               L("}", 3)+
              L("$", 2),
        "ast": 
            B("Block", 0)+
             B("If", 1)+
              L("true", 2)+
              L("Block",2),
        "error": {lvl: null, msg: null}
    },
    {
        "test": '{if a {}}$',
        "describe": "parse if stmt with invalid boolean expr",
        "result": null,
        "error": error("Expected BooleanExpression got Id on line 1")
    },  
    {
        "test": '{while a {}}$',
        "describe": "parse while stmt with invalid boolean expr",
        "result": null,
        "error": error("Expected BooleanExpression got Id on line 1")
    },  
    {
        "test": "{}{}$",
        "describe": "Parse Invalid Second Top Level block",
        "result": null,
        "error": error("Expected EOP got LBracket on line 1")
    },
    {
        "test": "{}$a",
        "describe": "Unexpected Token after EOP",
        "result": null,
        "error": error("Unexpected token 'a' after EOP")
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
            it(test.describe + " CST ", ()=> {
                expect(result.cst.toString()).to.deep.equal(test.result);
            });
        }
        if(result.ast && test.ast) {
            it(test.describe + " AST", ()=> {
                expect(result.ast.toString()).to.deep.equal(test.ast);
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