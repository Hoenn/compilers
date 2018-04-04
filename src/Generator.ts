import {SyntaxTree, Node} from "./SyntaxTree";
import {SymbolTree, ScopeNode} from './SymbolTree';
import {Alert, isAlert, error} from "./Alert";

export class Generator {
    ast: SyntaxTree;
    st: SymbolTree;
    mCode: string[];
    log: string[];
    error: Alert | undefined;
    constructor(ast: SyntaxTree, st: SymbolTree) {
        this.ast = ast;
        this.st = st;
        this.st.current = this.st.root;
        this.mCode = [];
        this.log = [];
        this.error = undefined;
    }

    generate(): {mCode: string[], log: string[], error: Alert|undefined} {
        this.genNext(this.ast.root);
        this.pushCode("break");
        return {mCode:this.mCode, log: this.log, error: this.error};
    }
    genNext(n: Node) {
        switch(n.name) {
            case "Block": {
                this.genBlock(n);
                break;
            }
            case "Print": {
                this.genPrint(n);
                break;
            }
        }
    }
    genBlock(n: Node) {
        this.emit("Generating code: Block");
        for(let i = 0; i < n.children.length; i++) {
            this.genNext(n.children[i]);
        }
    }
    genPrint(n: Node) {
        this.emit("Generating code: Print");
        //Expect only one child that is an integer...
        this.pushCode(["loadXConst", "01"]);
        let val = n.children[0].name;
        this.pushCode(["loadYConst", this.toHexString(val)])
        this.pushCode("sysCall");
    }
    pushCode(s: string | string[]) {
        if(typeof s == "string") {
            if(this.op[s]){
                this.mCode.push(this.op[s]);
            } else {
                this.mCode.push(s);
            }
        } else {
            for(let i = 0; i < s.length; i ++) {
                if(this.op[s[i]]) {
                    this.mCode.push(this.op[s[i]]);
                } else {
                    this.mCode.push(s[i]);
                }
            }
        }
    }
    toHexString(n: number| string): string {
        if(typeof(n) == "string") {
            n = parseInt(n);
        }
        let s = n.toString(16);
        if(s.length == 1) {
            s = "0"+s;
        }
        return s;

    }
    emit(s: string) {
        this.log.push(s);
    }
    //name -> opcode
    readonly op: {[key:string]:string} =
    {
        "loadAccConst": "A9", //A9 08 (constant)
        "loadAccMem":   "AD", //AD 28 00 (memory addr)
        "storeAccMem":  "8D", //8D 28 00 
        "addWithCarry": "6D", //6D 28 00 Add memory contents to acc
        "loadXConst":   "A2", //A2 08 
        "loadXMem":     "AE", //AE 28 00
        "loadYConst":   "A0", 
        "loadYMem":     "AC",
        "noOp":         "EA",
        "break":        "00", //End program
        "compareEq":    "EC", //Compare byte in memory to X reg, sets Z flag if equal
        "branchNotEqual": "EC", //Branches if Z flag is 0 (not set)
        "incrementByte": "EE",  
        //01 in X reg -> print integer stores in Y reg
        //02 in X reg -> print 00-terminated string stored in mem addr in Y reg
        "sysCall":      "FF"
    }
    
}