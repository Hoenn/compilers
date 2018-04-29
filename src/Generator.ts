import {SyntaxTree, Node} from "./SyntaxTree";
import {SymbolTree, ScopeNode} from './SymbolTree';
import {Alert, isAlert, error} from "./Alert";
import {StaticDataTable} from "./StaticDataTable";
import {Heap} from "./Heap";
import {TokenRegex} from "./Token";

export class Generator {
    ast: SyntaxTree;
    st: SymbolTree;
    mCode: string[];
    log: string[];
    error: Alert | undefined;
    staticData: StaticDataTable;
    jumpTable: {[addr: string]: {start?: number, dest?: number} };
    heap: Heap;
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
    jumps = 0;

    constructor(ast: SyntaxTree, st: SymbolTree) {
        this.ast = ast;
        this.st = st;
        this.st.current = this.st.root;
        this.mCode = [];
        this.log = [];
        this.staticData = new StaticDataTable(st);
        this.jumpTable =  {};
        this.currScopeId = 0;
        this.heap = new Heap();
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
            case "If": {
                this.genIf(n, scope);
                break;
            }
            case "While": {
                this.genWhile(n, scope);
                break;
            }
            default: {
                //AST leaf nodes
                if(n.isString){
                    this.genString(n);
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
        let child = n.children[0];
        if(child.isString) {
            this.emit("Printing string literal");
            let stringAddr = this.toHexString(this.heap.add(child.name));
            this.pushCode([ops.loadAccMem, stringAddr, "00"]);
            this.pushCode([ops.loadYConst, stringAddr]);
            this.pushCode([ops.storeAccMem, this.tempb1, this.temp1b2]);
            this.pushCode([ops.loadXConst, "02"]);
        } else if (child.name.match(TokenRegex.Id)) {
            //Get the scope of this variable and get the address assoc. in the static data table
            let addr = this.toHexString(this.staticData.findAddr(child.name, scope));
            switch(this.staticData.getVar(child.name, scope).type) {
                case "int": {
                    this.emit("Printing variable of type int");
                    this.pushCode([ops.loadYMem, this.tempb1, addr, ops.loadXConst, "01"]);
                    break;   
                }
                case "boolean": {
                    this.emit("Printing variable of type boolean");
                    this.loadBooleanStrings = true;
                    this.pushCode([ops.loadXConst, "01", ops.compareEq, this.tempb1, addr]);
                    this.pushCode([ops.loadYConst, this.tempFalseb1]);
                    this.pushCode([ops.branchNotEqual, "02", ops.loadYConst, this.tempTrueb1]);
                    this.pushCode([ops.loadXConst, "02"]);

                    break;
                }
                case "string": {
                    this.emit("Printing variable of type string");
                    this.pushCode([ops.loadYMem, this.tempb1, addr, ops.loadXConst, "02"]);
                    break;
                }
                default: {
                    console.log("Should not get here");
                }
            }
        }
        else if(child.name.match(TokenRegex.BoolLiteral) || child.name.match(TokenRegex.BoolOp)) {
            //Bool Expr
            this.loadBooleanStrings = true;
            this.genNext(child, scope);
            this.pushCode([ops.loadXConst, "01"]);

            this.pushCode([ops.loadYConst, this.tempFalseb1]);
            this.pushCode([ops.branchNotEqual, "02"])
            this.pushCode([ops.loadYConst, this.tempTrueb1])
            this.pushCode([ops.loadXConst, "02"]);
        } else { //int and plusexpr
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
        let backPatchAddr = this.toHexString(this.staticData.add(n.children[1], scope, n.children[1].type));
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
    genIf(n: Node, scope:number) {
        this.emit("Generate code: If Statement");
        this.genNext(n.children[0], scope);
        let addrAfterCondition = this.currNumBytes+1;
        //Store the current jump id
        let jumpNum = this.jumps;
        //Add the start address to jump table and move up to next jumpId
        this.jumpTable['J'+this.jumps++] = ({start: addrAfterCondition});
        //Push a temporary Jump id which is the key in the jumpTable
        this.pushCode([ops.branchNotEqual, 'J'+jumpNum]);
        this.genNext(n.children[1], scope);
        //After generating other child we use the difference in bytes
        //Between start and dest to determine jump distance
        this.jumpTable['J'+jumpNum].dest = this.currNumBytes+1;
    }
    genWhile(n: Node, scope: number) {
        this.emit("Generate code: While Loop");
        //Store the current address since we'll need to loop back to this point on true
        console.log(this.toHexString(this.currNumBytes));
        let conditionAddress = this.currNumBytes;
        //Gen the condition 
        this.genNext(n.children[0], scope);
        //Set the start point for jumping over the body
        let bodyAddr = this.currNumBytes;
        let jumpNum = this.jumps;
        this.jumpTable['J'+this.jumps++] = ({start: bodyAddr});
        this.pushCode([ops.branchNotEqual, 'J'+jumpNum]);
        //Gen the body, this.currNumBytes will be used to figure out how long the body is
        this.genNext(n.children[1], scope);
        console.log(this.toHexString(bodyAddr));
        this.pushCode([ops.loadAccConst, "00", ops.storeAccMem, 'J'+jumpNum, "00"]);
        this.pushCode([ops.loadXConst, "01", ops.compareEq, 'J'+jumpNum, "00"]);

        //Can only jump forward so we'll need to loop around to the start of the pgm
        let loopingJump = this.toHexString(256 - (this.currNumBytes + conditionAddress)-2);
        this.pushCode([ops.branchNotEqual, loopingJump]);        
        //We now know the end point of the loop so set the dest in the jumpTable
        this.jumpTable['J'+jumpNum].dest = this.currNumBytes;
        console.log(this.jumpTable);

    }
    genString(n: Node) {
        this.emit("Generate code: string");
        let stringAddr = this.toHexString(this.heap.add(n.name));
        this.pushCode([ops.loadAccConst, stringAddr]);
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
    insertCode(s: string, loc: number) {
        this.currNumBytes++;
        this.mCode[loc] = s;
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
        } else {
            this.emit("Optimization: Skipping boolean literal string backpatching (11B)");
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

        location = 256-this.heap.data.length;
        //Heap begins here
        this.emit("Backpatching Heap");
        this.insertBytes(location, this.heap.data);
        location++;

        this.emit("Backpatching Jump table");
        for(let j in this.jumpTable) {
            console.log(j);
            let dest = this.jumpTable[j].dest;
            let start = this.jumpTable[j].start;
            let finalLoc = 0;
            if(dest && start) {
                finalLoc = dest - start - 2;
            } else {
                console.log("Error backpatching jump table");
            }
            this.replaceAllByte(j, this.toHexString(finalLoc));

        }

        this.emit("Padding heapspace with zeroes");
        this.zeroOut();

    }
    replaceEndian(location:number, search:string) {
        for(let i = 0; i < this.mCode.length; i++) {
            let currentByte = this.mCode[i];
            let nextByte = this.mCode[i+1];
            if(currentByte == this.tempb1 && nextByte == search) {
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
    zeroOut() {
        for(let i = 0; i < 256; i++) {
            if(this.mCode[i] == undefined) {
                this.mCode[i] = "00";
            }
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