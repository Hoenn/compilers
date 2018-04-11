import {SyntaxTree, Node} from "./SyntaxTree";
import {SymbolTree, ScopeNode} from './SymbolTree';
import {Alert, isAlert, error} from "./Alert";
import {StaticDataTable} from "./StaticDataTable";

export class Generator {
    ast: SyntaxTree;
    st: SymbolTree;
    mCode: string[];
    log: string[];
    error: Alert | undefined;
    staticData: StaticDataTable;
    currScopeId: number;
    readonly tempb1 = "tm";
    readonly temp1b2 = "p1";
    readonly temp2b2 = "p2";

    constructor(ast: SyntaxTree, st: SymbolTree) {
        this.ast = ast;
        this.st = st;
        this.st.current = this.st.root;
        this.mCode = [];
        this.log = [];
        this.error = undefined;
        this.staticData = new StaticDataTable();
        this.currScopeId = -1;
    }

    generate(): {mCode: string[], log: string[], error: Alert|undefined} {
        this.genNext(this.ast.root, 0);
        this.pushCode(ops.break);
        //Back patching temp variable locations
        let lengthInBytes = this.mCode.length;
        this.replaceTemps(lengthInBytes);
        
        return {mCode:this.mCode, log: this.log, error: this.error};
    }
    genNext(n: Node, scope:number){
        switch(n.name) {
            case "Block": {
                this.genBlock(n);
                break;
            }
            case "Print": {
                this.genPrint(n, scope);
                break;
            }
            case "VarDecl": {
                this.genVarDecl(n, scope);
                break;
            }
            case "Plus": {
                this.genPlus(n, scope);
                break;
            }
            default: {
                //AST leaf nodes
                if(n.isString){
                    //this.getString(n);
                } else if(n.name.length == 1){ //identifier
                   this.genIdentifier(n, scope);
                } else if(n.name == "true" || n.name == "false") {
                   //this.getBoolean(n);
                } else {
                    this.genInt(n);
                }
                break;
            }
        }
    }
    genBlock(n: Node) {
        this.emit("Generating code: Block");
        let scope = this.currScopeId++;
        for(let i = 0; i < n.children.length; i++) {
            this.genNext(n.children[i], scope);
        }
    }
    genPrint(n: Node, scope: number) {
        this.emit("Generating code: Print");
        //handle strings
        //handle ids
        //handle integer|boolean const/expr
            //By now child[0] can be int/bool const or int/bool expr
        let child = n.children[0];
        this.genNext(child, scope);
        this.pushCode([ops.loadXConst, "01"]);
        this.pushCode([ops.storeAccMem, this.tempb1, this.temp1b2]);
        this.pushCode([ops.loadYMem, this.tempb1, this.temp1b2]);
        this.pushCode(ops.sysCall);
    }
    genVarDecl(n: Node, scope: number) {
        this.emit("Generating code: VarDecl");
        this.pushCode([ops.loadAccConst, "00"]);
        let backPatchAddr = this.toHexString(this.staticData.add(n.children[1], scope));
        //TM 03
        this.pushCode([ops.storeAccMem, this.tempb1, backPatchAddr]);
    }
    genPlus(n: Node, scope: number) {
        this.emit("Generate code: Plus");
        let left = n.children[0];
        let right = n.children[1];
        //Generate code for the right child 
        this.genNext(right, scope);
        this.pushCode([ops.storeAccMem, this.tempb1, this.temp1b2]);
        this.pushCode([ops.loadAccConst,this.toHexString(left.name)]);
        this.pushCode([ops.addWithCarry, this.tempb1, this.temp1b2]);
    }
    genIdentifier(n: Node, scope: number) {
        this.emit("Generate code: Identifier ("+n.name+")");
        let idAddr = this.staticData.findAddr(n.name, scope);
        let addrBytes = this.toHexString(idAddr);
        this.pushCode([ops.loadAccMem, this.tempb1, addrBytes]);
    }
    genInt(n: Node) {
        this.emit("Generate code: int constant");
        this.pushCode([ops.loadAccConst, this.toHexString(n.name)]);
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
        return s.toUpperCase();

    }
    replaceTemps(len: number) {
        //Backpatch temporary variables 1, 2
        this.emit("Backpatching temporary storage address");
        this.emit("tmp1 -> " + this.toHexString(len) + "00");
        this.emit("tmp2 -> " + this.toHexString(len+1) + "00");
        let location = len;
        this.replaceEndian(location, this.temp1b2);
        location++;
        this.replaceEndian(location, this.temp2b2);
        location++;

        //Backpatch identifier variables
        this.emit("Backpatching static data addresses");
        for(let id in this.staticData.variables) {
            let tempNumByte = this.toHexString(this.staticData.variables[id].addr);
            this.emit("tm"+tempNumByte+ " -> "+this.toHexString(location)+"00");
            this.replaceEndian(location, tempNumByte);
            location++;
        }
    }
    replaceEndian(location:number, search:string) {
        for(let i = 0; i < this.mCode.length; i++) {
            let currentByte = this.mCode[i];
            let nextByte = this.mCode[i+1];
            if(nextByte == search) {
                this.mCode[i] = this.toHexString(location);
                this.mCode[i+1] = "00";
            } 

        }
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
enum ops {
        loadAccConst = "loadAccConst",
        loadAccMem = "loadAccMem",
        storeAccMem = "storeAccMem",
        addWithCarry = "addWithCarry",
        loadXConst = "loadXConst",
        loadYConst = "loadYConst",
        loadYMem = "loadYMem",
        noOp ="noOp",
        break ="break",
        compareEq ="compareEq",
        branchNotEqual = "branchNotEq",
        incrementByte = "incrementByte",
        sysCall = "sysCall"
}