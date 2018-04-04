"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Generator = /** @class */ (function () {
    function Generator(ast, st) {
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
            "branchNotEqual": "EC",
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
        this.error = undefined;
    }
    Generator.prototype.generate = function () {
        this.genNext(this.ast.root);
        this.pushCode("break");
        return { mCode: this.mCode, log: this.log, error: this.error };
    };
    Generator.prototype.genNext = function (n) {
        switch (n.name) {
            case "Block": {
                this.genBlock(n);
                break;
            }
            case "Print": {
                this.genPrint(n);
                break;
            }
        }
    };
    Generator.prototype.genBlock = function (n) {
        this.emit("Generating code: Block");
        for (var i = 0; i < n.children.length; i++) {
            this.genNext(n.children[i]);
        }
    };
    Generator.prototype.genPrint = function (n) {
        this.emit("Generating code: Print");
        //Expect only one child that is an integer...
        this.pushCode(["loadXConst", "01"]);
        var val = n.children[0].name;
        this.pushCode(["loadYConst", this.toHexString(val)]);
        this.pushCode("sysCall");
    };
    Generator.prototype.pushCode = function (s) {
        if (typeof s == "string") {
            if (this.op[s]) {
                this.mCode.push(this.op[s]);
            }
            else {
                this.mCode.push(s);
            }
        }
        else {
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
        return s;
    };
    Generator.prototype.emit = function (s) {
        this.log.push(s);
    };
    return Generator;
}());
exports.Generator = Generator;
