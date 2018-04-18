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
    currNumBytes = 0;

    loadBooleanStrings = false;
    readonly falseBytes = ["66", "61", "6C", "73", "65", "00"];
    readonly trueBytes = ["74", "72", "75", "65", "00"];
    readonly tempFalseb1 = "fl";
    readonly tempFalseb2 = "se";
    readonly tempTrueb1 = "tr";
    readonly tempTrueb2 = "ue";
    readonly tempb1 = "tm";
    readonly temp1b2 = "p1";
    readonly temp2b2 = "p2";

    constructor(ast: SyntaxTree, st: SymbolTree) {
        this.ast = ast;
        this.st = st;
        this.st.current = this.st.root;
        this.mCode = [];
        this.log = [];
        this.staticData = new StaticDataTable(st);
        this.currScopeId = 0;
    }

    generate(): {mCode: string[], log: string[], error: Alert|undefined} {
        this.genNext(this.ast.root, 0);
        this.pushCode(ops.break);
        //Back patching temp variable locations
        let lengthInBytes = this.mCode.length;
        this.backPatch(lengthInBytes);
        let outOfMem = this.checkOutOfMemory();
        return {mCode:this.mCode, log: this.log, error: outOfMem};
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
            case "Assignment": {
                this.genAssignment(n, scope);
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
                } else if(!isNaN(parseInt(n.name))){
                    this.genInt(n);
                }else if(n.name.length == 1){ //identifier
                   this.genIdentifier(n, scope);
                } else if(n.name == "true" || n.name == "false") {
                   this.genBoolean(n);
                } else {
                    console.log("Unimplemented");
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
        let child = n.children[0];
        if(child.name == "true" || child.name == "false") {
            this.loadBooleanStrings = true;
            this.genNext(child, scope);
            this.pushCode([ops.loadXConst, "01"]);

            this.pushCode([ops.loadYConst, this.tempFalseb1]);
            this.pushCode([ops.branchNotEqual, "02"])
            this.pushCode([ops.loadYConst, this.tempTrueb1])
            this.pushCode([ops.loadXConst, "02"]);
        } else { //int
            this.genNext(child, scope);
            this.pushCode([ops.loadXConst, "01"]);
            this.pushCode([ops.storeAccMem, this.tempb1, this.temp1b2]);
            this.pushCode([ops.loadYMem, this.tempb1, this.temp1b2]);
        }
        this.pushCode(ops.sysCall);
    }
    genVarDecl(n: Node, scope: number) {
        this.emit("Generating code: VarDecl");
        this.pushCode([ops.loadAccConst, "00"]);
        let backPatchAddr = this.toHexString(this.staticData.add(n.children[1], scope));
        //TM 03
        this.pushCode([ops.storeAccMem, this.tempb1, backPatchAddr]);
    }
    genAssignment(n: Node, scope: number) {
        this.emit("Generating code: Assignment");
        this.genNext(n.children[1], scope);
        let backPatchAddr = this.toHexString(this.staticData.findAddr(n.children[0].name, scope));
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
    genBoolean(n: Node) {
        this.emit("Generate code: boolean constant");
        //boolVal will be 1 or 0 for "true" and "false"
        let boolVal = n.name == "true" ? "1" : "0";
        this.pushCode([ops.loadAccConst, this.toHexString(boolVal), ops.storeAccMem, this.tempb1, this.temp1b2]);
        this.pushCode([ops.loadXConst, "01", ops.compareEq, this.tempb1, this.temp1b2]);

    }
    pushCode(s: string | string[]) {
        if(typeof s == "string") {
            if(this.op[s]){
                this.mCode.push(this.op[s]);
            } else {
                this.mCode.push(s);
            }
            this.currNumBytes++;
        } else {
            this.currNumBytes += s.length;
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
    backPatch(len: number) {
        //Backpatch temporary variables 1, 2
        this.emit("Backpatching temporary storage address");
        let location = len;
        if(this.loadBooleanStrings) {
            this.emit("Backpatching boolean literal strings");
            this.emit("tr ue -> " + this.toHexString(location) + "00");
            let tLoc = location;
            this.replaceEndian(location, this.tempTrueb2);
            this.replaceAllByte(this.tempTrueb1, this.toHexString(tLoc));
            this.insertBytes(location, this.trueBytes);
            location += this.trueBytes.length;
            let fLoc = location;
            this.emit("fl se -> " + this.toHexString(location) + "00");
            this.replaceEndian(location, this.tempFalseb2);
            this.replaceAllByte(this.tempFalseb1, this.toHexString(fLoc));
            this.insertBytes(location, this.falseBytes);
            location += this.falseBytes.length
        }
        this.emit("tmp1 -> " + this.toHexString(location) + "00");
        this.emit("tmp2 -> " + this.toHexString(location+1) + "00");
        this.replaceEndian(location, this.temp1b2);
        location++;
        this.replaceEndian(location, this.temp2b2);
        location++;
        //Backpatch identifier variables
        this.emit("Backpatching static data addresses");
        for(let id in this.staticData.variables) {
            let tempNumByte = this.toHexString(this.staticData.variables[id].addr);
            this.emit("tm"+tempNumByte+ "("+id+") -> "+this.toHexString(location)+"00");
            this.replaceEndian(location, tempNumByte);
            location++;
        }

        //Heap begins here
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
    replaceAllByte(searchByte: string, replaceWithByte: string) {
        for(let i = 0; i < this.mCode.length; i++) {
            let currentByte = this.mCode[i];
            if(currentByte == searchByte) {
                this.mCode[i] = replaceWithByte;
            }
        }
    }
    insertBytes(location: number, bytes: string[]) {
        for(let i = 0; i < bytes.length; i++) {
            this.mCode[location+i] = bytes[i];
        }
    }
    emit(s: string) {
        this.log.push(s);
    }
    checkOutOfMemory(): Alert | undefined{
        let actual = Object.keys(this.staticData.variables).length + this.currNumBytes;
        return actual > 255 ? Generator.outOfMemory() : undefined
    }
    static outOfMemory(): Alert {
        return error("Out of memory! Executable image exceeds 256 Bytes");
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
        "branchNotEq": "D0", //Branches if Z flag is 0 (not set)
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