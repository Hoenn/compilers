import { Parser } from "../src/Parser";
import { Lexer } from "../src/Lexer";
import { SemanticAnalyzer } from "../src/SemanticAnalyzer";
import { error, warning, Alert} from "../src/Alert";
import { expect } from 'chai';
import 'mocha';

var Lex = new Lexer();

const tests = [
    {
        "test": "{}$",
        "describe": "Analyze empty block",
        "warnings": [],
        "error": undefined
    },
    {
        "test": "{int x x = 3}$",
        "describe": "Unused but initialized",
        "warnings": [warning("Initialized but unused variable: int x on line: 1")],
        "error": undefined
    },
    {
        "test": "{int x}$",
        "describe": "Unused and not initialized",
        "warnings": [warning("Unused variable: int x on line: 1")],
        "error": undefined
    },
    {
        "test": "{int x print(x)}$",
        "describe": "Used but not initialized",
        "warnings": [warning("Use of uninitialized variable: x on line: 1")],
        "error": undefined
    },
    {
        "test": "{int x int y}$",
        "describe": "Multiple unused+not initialized",
        "warnings": [
            warning("Unused variable: int x on line: 1"),
            warning("Unused variable: int y on line: 1")
        ],
        "error": undefined
    },
    {
        "test": "{int x int x}$",
        "describe": "Redeclared in same scope",
        "warnings": [], 
        "error": redeclaredVar(1, "x") 
       },
    {
        "test": "{int x {int x } }$",
        "describe": "Shadowing parent scoped variable",
        "warnings": [], //Ignore warnings
        "error": undefined
    },
    {
        "test": "{int x x = true}$",
        "describe": "Type mismatch on assignment",
        "warnings": [],
        "error": typeMismatch(1, "int", "boolean")
    },
    {
        "test": "{int x boolean y x = y}$",
        "describe": "Type mismatch on assignment to variable value",
        "warnings": [],
        "error": typeMismatch(1, "int", "boolean")
    },
    {
        "test": "{int x x = 3 int y  y = 1 + 2 + x}$",
        "describe": "Types match in nested addition assignment",
        "warnings": [], //Ignore warnings
        "error": undefined
    },
    {
        "test": "{boolean x x = true int y y = 1 + 2 + x}$",
        "describe": "Type mismatch in nested addition assignment",
        "warnings": [],
        "error": typeMismatch(1, "int", "boolean")
    },
    {
        "test": "{if true { print(true)}}$",
        "describe": "If with bool literal",
        "warnings": [],
        "error": undefined
    },
    {
        "test": "{int x if(x == true) {} }$",
        "describe": "Type mismatch inside If bool compare",
        "warnings": [],
        "error": typeMismatch(1, "int", "boolean")
    },
    {
        "test": "{if(true == (false != (true == true))){}}$",
        "describe": "Types match in very nested If bool literal compare",
        "warnings": [],
        "error": undefined
    },
    {
        "test": "{{ int y } print(y)}$",
        "describe": "Variable out of scope",
        "warnings": [],
        "error": undeclaredVar(1, "y")
    },
    {
        "test": "{boolean x x = true while(x == true){}}$",
        "describe": "Types match in while with bool compare with bool var",
        "warnings": [],
        "error": undefined
    },
    {
        "test": "{int x {int x} int x}$",
        "describe": "Shadow variable in child scope but redeclare in same scope",
        "warnings": [],
        "error": redeclaredVar(1, "x")
    },
    {
        "test": "{x = 3}$",
        "describe": "Undeclared var in assignment",
        "warnings": [],
        "error": undeclaredVar(1, "x")
    },
    {
        "test": "{boolean x boolean y if(x == y){}}$",
        "describe": "Types match If BoolExp with two variables",
        "warnings": [],//Ignore warnings
        "error": undefined
    },
    {
        "test": "{int x boolean y if(x != y){}}$",
        "describe": "Type mismatch If BoolExp with two variables",
        "warnings": [], //Ignore warnings
        "error": typeMismatch(1, "int", "boolean")
    },
    {
        "test": "{print(1 + 2 + 3 + x)}$",
        "describe": "Undeclared variable in nested addition print",
        "warnings": [],
        "error": undeclaredVar(1, "x")
    },
    {
        "test": "{int x print(1 + 2 +3 +x)}$",
        "describe": "Types match in nested addition print",
        "warnings": [warning("Use of uninitialized variable: x on line: 1")],
        "error": undefined
    },
    {
        "test": '{string x x ="abc" print(1 + 2 + 3 + x)}$',
        "describe": "Type mismatch in nested addition print",
        "warnings": [],
        "error": typeMismatch(1, "int", "string")
    },
    {
        "test": '{boolean x int y if true { print((x == y)) } }$',
        "describe": "Type mismatch within child scope of If in a print",
        "warnings": [], //Ignore warnings
        "error": typeMismatch(1, "boolean", "int")
    },
    {
        "test": '{boolean x string y while true { print((x != y)) } }$',
        "describe": "Type mismatch within child scope of While in a print",
        "warnings": [], //Ignore warnings
        "error": typeMismatch(1, "boolean", "string")
    },
    {
        "test": '{int a print((a == "a"))}$',
        "describe": "Type mismatch on comparison with id and 1 letter string",
        "warnings": [], //Ignore warnings
        "error": typeMismatch(1, "int", "string")
    },
    {
        "test": '{ if (true == "true"){}}$',
        "describe": "Type mismatch within If BoolExp bool literal and 'true'",
        "warnings": [],
        "error": typeMismatch(1, "boolean", "string")
    }
]

tests.forEach(function(test) {
    describe('Analyze: '+test.test+": "+test.describe, () =>{
        let tokens = Lex.lex(test.test).t;
        let P = new Parser(tokens);
        let parse = P.parse();
        let SA = new SemanticAnalyzer(parse.ast);
        let result = SA.analyze();
        if(test.error) {
            it('Should report: '+test.error.lvl+': '+test.error.msg, () => {
                expect(result.error).to.deep.equal(test.error);
            });
        } else {
            it('Should report: no errors', () => {
                expect(result.error).to.deep.equal(undefined);
            });
        }
        //If there are any warnings expected
        if(test.warnings.length > 0) {
            for(let i = 0; i < test.warnings.length; i++) {
                it('Should report: warning: '+test.warnings[i].msg, ()=> {
                    expect(result.warnings[i]).to.deep.equal(test.warnings[i]);
                })
            }
        }
    });
});

function typeMismatch(l: number, e: string, a: string): Alert {
    return error("Type mismatch on line: "+l+" expected: "+e+" but got: "+a);
}
function redeclaredVar(l: number, id: string) {
    return error("Redeclared variable: "+id+" on line: "+l);
}
function undeclaredVar(l: number, id: string) {
    return error("Undeclared variable: "+id+" on line: "+l);
}
function warningsString(warnings: Alert[]): string {
    let result = "";
    for(let w of warnings){
       result += w.msg +"\n"; 
    }
    return result;
}