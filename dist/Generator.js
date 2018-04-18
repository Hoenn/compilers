"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Alert_1 = require("./Alert");
var StaticDataTable_1 = require("./StaticDataTable");
var Generator = /** @class */ (function () {
    function Generator(ast, st) {
        this.currNumBytes = 0;
        this.loadBooleanStrings = false;
        this.falseBytes = ["66", "61", "6C", "73", "65", "00"];
        this.trueBytes = ["74", "72", "75", "65", "00"];
        this.tempFalseb1 = "fl";
        this.tempFalseb2 = "se";
        this.tempTrueb1 = "tr";
        this.tempTrueb2 = "ue";
        this.tempb1 = "tm";
        this.temp1b2 = "p1";
        this.temp2b2 = "p2";
        //name -> opcode
        this.op = {
            "loadAccConst": "A9",
            "loadAccMem": "AD",
            "storeAccMem": "8D",
            "addWithCarry": "6D",
            "loadXConst": "A2",
            "loadXMem": "AE",
            "loadYConst": "A0",
            "loadYMem": "AC",
            "noOp": "EA",
            "break": "00",
            "compareEq": "EC",
            "branchNotEq": "D0",
            "incrementByte": "EE",
            //01 in X reg -> print integer stores in Y reg
            //02 in X reg -> print 00-terminated string stored in mem addr in Y reg
            "sysCall": "FF"
        };
        this.ast = ast;
        this.st = st;
        this.st.current = this.st.root;
        this.mCode = [];
        this.log = [];
        this.staticData = new StaticDataTable_1.StaticDataTable(st);
        this.currScopeId = 0;
    }
    Generator.prototype.generate = function () {
        this.genNext(this.ast.root, 0);
        this.pushCode(ops.break);
        //Back patching temp variable locations
        var lengthInBytes = this.mCode.length;
        this.backPatch(lengthInBytes);
        var outOfMem = this.checkOutOfMemory();
        return { mCode: this.mCode, log: this.log, error: outOfMem };
    };
    Generator.prototype.genNext = function (n, scope) {
        switch (n.name) {
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
                if (n.isString) {
                    //this.getString(n);
                }
                else if (!isNaN(parseInt(n.name))) {
                    this.genInt(n);
                }
                else if (n.name.length == 1) {
                    this.genIdentifier(n, scope);
                }
                else if (n.name == "true" || n.name == "false") {
                    this.genBoolean(n);
                }
                else {
                    console.log("Unimplemented");
                }
                break;
            }
        }
    };
    Generator.prototype.genBlock = function (n) {
        this.emit("Generating code: Block");
        var scope = this.currScopeId++;
        for (var i = 0; i < n.children.length; i++) {
            this.genNext(n.children[i], scope);
        }
    };
    Generator.prototype.genPrint = function (n, scope) {
        this.emit("Generating code: Print");
        //handle strings
        //handle ids
        var child = n.children[0];
        if (child.name == "true" || child.name == "false") {
            this.loadBooleanStrings = true;
            this.genNext(child, scope);
            this.pushCode([ops.loadXConst, "01"]);
            this.pushCode([ops.loadYConst, this.tempFalseb1]);
            this.pushCode([ops.branchNotEqual, "02"]);
            this.pushCode([ops.loadYConst, this.tempTrueb1]);
            this.pushCode([ops.loadXConst, "02"]);
        }
        else {
            this.genNext(child, scope);
            this.pushCode([ops.loadXConst, "01"]);
            this.pushCode([ops.storeAccMem, this.tempb1, this.temp1b2]);
            this.pushCode([ops.loadYMem, this.tempb1, this.temp1b2]);
        }
        this.pushCode(ops.sysCall);
    };
    Generator.prototype.genVarDecl = function (n, scope) {
        this.emit("Generating code: VarDecl");
        this.pushCode([ops.loadAccConst, "00"]);
        var backPatchAddr = this.toHexString(this.staticData.add(n.children[1], scope));
        //TM 03
        this.pushCode([ops.storeAccMem, this.tempb1, backPatchAddr]);
    };
    Generator.prototype.genAssignment = function (n, scope) {
        this.emit("Generating code: Assignment");
        this.genNext(n.children[1], scope);
        var backPatchAddr = this.toHexString(this.staticData.findAddr(n.children[0].name, scope));
        this.pushCode([ops.storeAccMem, this.tempb1, backPatchAddr]);
    };
    Generator.prototype.genPlus = function (n, scope) {
        this.emit("Generate code: Plus");
        var left = n.children[0];
        var right = n.children[1];
        //Generate code for the right child 
        this.genNext(right, scope);
        this.pushCode([ops.storeAccMem, this.tempb1, this.temp1b2]);
        this.pushCode([ops.loadAccConst, this.toHexString(left.name)]);
        this.pushCode([ops.addWithCarry, this.tempb1, this.temp1b2]);
    };
    Generator.prototype.genIdentifier = function (n, scope) {
        this.emit("Generate code: Identifier (" + n.name + ")");
        var idAddr = this.staticData.findAddr(n.name, scope);
        var addrBytes = this.toHexString(idAddr);
        this.pushCode([ops.loadAccMem, this.tempb1, addrBytes]);
    };
    Generator.prototype.genInt = function (n) {
        this.emit("Generate code: int constant");
        this.pushCode([ops.loadAccConst, this.toHexString(n.name)]);
    };
    Generator.prototype.genBoolean = function (n) {
        this.emit("Generate code: boolean constant");
        //boolVal will be 1 or 0 for "true" and "false"
        var boolVal = n.name == "true" ? "1" : "0";
        this.pushCode([ops.loadAccConst, this.toHexString(boolVal), ops.storeAccMem, this.tempb1, this.temp1b2]);
        this.pushCode([ops.loadXConst, "01", ops.compareEq, this.tempb1, this.temp1b2]);
    };
    Generator.prototype.pushCode = function (s) {
        if (typeof s == "string") {
            if (this.op[s]) {
                this.mCode.push(this.op[s]);
            }
            else {
                this.mCode.push(s);
            }
            this.currNumBytes++;
        }
        else {
            this.currNumBytes += s.length;
            for (var i = 0; i < s.length; i++) {
                if (this.op[s[i]]) {
                    this.mCode.push(this.op[s[i]]);
                }
                else {
                    this.mCode.push(s[i]);
                }
            }
        }
    };
    Generator.prototype.toHexString = function (n) {
        if (typeof (n) == "string") {
            n = parseInt(n);
        }
        var s = n.toString(16);
        if (s.length == 1) {
            s = "0" + s;
        }
        return s.toUpperCase();
    };
    Generator.prototype.backPatch = function (len) {
        //Backpatch temporary variables 1, 2
        this.emit("Backpatching temporary storage address");
        var location = len;
        if (this.loadBooleanStrings) {
            this.emit("Backpatching boolean literal strings");
            this.emit("tr ue -> " + this.toHexString(location) + "00");
            var tLoc = location;
            this.replaceEndian(location, this.tempTrueb2);
            this.replaceAllByte(this.tempTrueb1, this.toHexString(tLoc));
            this.insertBytes(location, this.trueBytes);
            location += this.trueBytes.length;
            var fLoc = location;
            this.emit("fl se -> " + this.toHexString(location) + "00");
            this.replaceEndian(location, this.tempFalseb2);
            this.replaceAllByte(this.tempFalseb1, this.toHexString(fLoc));
            this.insertBytes(location, this.falseBytes);
            location += this.falseBytes.length;
        }
        this.emit("tmp1 -> " + this.toHexString(location) + "00");
        this.emit("tmp2 -> " + this.toHexString(location + 1) + "00");
        this.replaceEndian(location, this.temp1b2);
        location++;
        this.replaceEndian(location, this.temp2b2);
        location++;
        //Backpatch identifier variables
        this.emit("Backpatching static data addresses");
        for (var id in this.staticData.variables) {
            var tempNumByte = this.toHexString(this.staticData.variables[id].addr);
            this.emit("tm" + tempNumByte + "(" + id + ") -> " + this.toHexString(location) + "00");
            this.replaceEndian(location, tempNumByte);
            location++;
        }
        //Heap begins here
    };
    Generator.prototype.replaceEndian = function (location, search) {
        for (var i = 0; i < this.mCode.length; i++) {
            var currentByte = this.mCode[i];
            var nextByte = this.mCode[i + 1];
            if (nextByte == search) {
                this.mCode[i] = this.toHexString(location);
                this.mCode[i + 1] = "00";
            }
        }
    };
    Generator.prototype.replaceAllByte = function (searchByte, replaceWithByte) {
        for (var i = 0; i < this.mCode.length; i++) {
            var currentByte = this.mCode[i];
            if (currentByte == searchByte) {
                this.mCode[i] = replaceWithByte;
            }
        }
    };
    Generator.prototype.insertBytes = function (location, bytes) {
        for (var i = 0; i < bytes.length; i++) {
            this.mCode[location + i] = bytes[i];
        }
    };
    Generator.prototype.emit = function (s) {
        this.log.push(s);
    };
    Generator.prototype.checkOutOfMemory = function () {
        var actual = Object.keys(this.staticData.variables).length + this.currNumBytes;
        return actual > 255 ? Generator.outOfMemory() : undefined;
    };
    Generator.outOfMemory = function () {
        return Alert_1.error("Out of memory! Executable image exceeds 256 Bytes");
    };
    return Generator;
}());
exports.Generator = Generator;
var ops;
(function (ops) {
    ops["loadAccConst"] = "loadAccConst";
    ops["loadAccMem"] = "loadAccMem";
    ops["storeAccMem"] = "storeAccMem";
    ops["addWithCarry"] = "addWithCarry";
    ops["loadXConst"] = "loadXConst";
    ops["loadYConst"] = "loadYConst";
    ops["loadYMem"] = "loadYMem";
    ops["noOp"] = "noOp";
    ops["break"] = "break";
    ops["compareEq"] = "compareEq";
    ops["branchNotEqual"] = "branchNotEq";
    ops["incrementByte"] = "incrementByte";
    ops["sysCall"] = "sysCall";
})(ops || (ops = {}));
