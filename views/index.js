(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Token_1 = require("./Token");
var Lexer = /** @class */ (function () {
    function Lexer() {
    }
    Lexer.prototype.lex = function (src) {
        //Break text into blobs to perform longest match on
        //filter out undefined blobs
        var tokenBlobs = src.split(Token_1.TokenRegex.Split).filter(function (defined) { return defined; });
        var lineNum = 1;
        console.log(tokenBlobs);
        var tokens = [];
        var result = { t: null, e: null };
        for (var _i = 0, tokenBlobs_1 = tokenBlobs; _i < tokenBlobs_1.length; _i++) {
            var blob = tokenBlobs_1[_i];
            //If a comment or whitespace just skip
            if (blob.match(Token_1.TokenRegex.Comment) || blob.match(Token_1.TokenRegex.WhiteSpace)) {
                //If newline is found increment lineNum but skip
                if (blob.match("\n")) {
                    lineNum += 1;
                }
                continue;
            }
            result = this.longestMatch(blob, lineNum);
            if (result.t) {
                for (var _a = 0, _b = result.t; _a < _b.length; _a++) {
                    var t = _b[_a];
                    tokens.push(t);
                }
            }
            //It's possible to have valid tokens returned along with an error
            if (result.e) {
                console.log(result.e);
                break;
            }
        }
        //If we have no errors, check if EOP is missing. No need if there are other lex errors
        if (result.e === null) {
            if (tokens.length == 0 || tokens[tokens.length - 1].kind != Token_1.TokenType.EOP) {
                tokens.push(new Token_1.Token(Token_1.TokenType.EOP, "$", lineNum));
                result.e = this.warning("End of Program missing. Added $ symbol.");
            }
        }
        console.log(tokens);
        return { t: tokens, e: result.e };
    };
    Lexer.prototype.longestMatch = function (blob, lineNum) {
        if (Token_1.TokenRegex.Quote.test(blob)) {
            //Break "quoted" blob into characters after removing comments
            var noComment = blob.replace(/\/\*.*\*\//g, "");
            var splitQuote = noComment.split("");
            var tokenArray = [];
            for (var _i = 0, splitQuote_1 = splitQuote; _i < splitQuote_1.length; _i++) {
                var char = splitQuote_1[_i];
                //If it's a quote simply add that token
                if (char === "\"") {
                    tokenArray.push(new Token_1.Token(Token_1.TokenType.Quote, char, lineNum));
                }
                else if (char.match(/[a-z]/) || char.match(/\s/)) {
                    //If it's a new line, accurately report it
                    if (char.match("\n")) {
                        return { t: tokenArray, e: this.error("[\n]", lineNum) };
                    }
                    //If it's a letter or space add that token
                    tokenArray.push(new Token_1.Token(Token_1.TokenType.Char, char, lineNum));
                }
                else {
                    //"quoted" may only contain valid lexemes (chars)
                    return { t: tokenArray, e: this.error(char, lineNum) };
                }
            }
            return { t: tokenArray, e: null };
        }
        else if (Token_1.TokenRegex.While.test(blob)) {
            return { t: [new Token_1.Token(Token_1.TokenType.While, blob, lineNum)], e: null };
        }
        else if (Token_1.TokenRegex.Print.test(blob)) {
            return { t: [new Token_1.Token(Token_1.TokenType.Print, blob, lineNum)], e: null };
        }
        else if (Token_1.TokenRegex.EOP.test(blob)) {
            return { t: [new Token_1.Token(Token_1.TokenType.EOP, blob, lineNum)], e: null };
        }
        else if (Token_1.TokenRegex.VarType.test(blob)) {
            return { t: [new Token_1.Token(Token_1.TokenType.VarType, blob, lineNum)], e: null };
        }
        else if (Token_1.TokenRegex.If.test(blob)) {
            return { t: [new Token_1.Token(Token_1.TokenType.If, blob, lineNum)], e: null };
        }
        else if (Token_1.TokenRegex.BoolLiteral.test(blob)) {
            return { t: [new Token_1.Token(Token_1.TokenType.BoolLiteral, blob, lineNum)], e: null };
        }
        else if (Token_1.TokenRegex.Id.test(blob)) {
            return { t: [new Token_1.Token(Token_1.TokenType.Id, blob, lineNum)], e: null };
        }
        else if (Token_1.TokenRegex.Digit.test(blob)) {
            return { t: [new Token_1.Token(Token_1.TokenType.Digit, blob, lineNum)], e: null };
        }
        else if (Token_1.TokenRegex.Assign.test(blob)) {
            return { t: [new Token_1.Token(Token_1.TokenType.Assign, blob, lineNum)], e: null };
        }
        else if (Token_1.TokenRegex.IntOp.test(blob)) {
            return { t: [new Token_1.Token(Token_1.TokenType.IntOp, blob, lineNum)], e: null };
        }
        else if (Token_1.TokenRegex.BoolOp.test(blob)) {
            return { t: [new Token_1.Token(Token_1.TokenType.BoolOp, blob, lineNum)], e: null };
        }
        else if (Token_1.TokenRegex.LParen.test(blob)) {
            return { t: [new Token_1.Token(Token_1.TokenType.LParen, blob, lineNum)], e: null };
        }
        else if (Token_1.TokenRegex.RParen.test(blob)) {
            return { t: [new Token_1.Token(Token_1.TokenType.RParen, blob, lineNum)], e: null };
        }
        else if (Token_1.TokenRegex.LBracket.test(blob)) {
            return { t: [new Token_1.Token(Token_1.TokenType.LBracket, blob, lineNum)], e: null };
        }
        else if (Token_1.TokenRegex.RBracket.test(blob)) {
            return { t: [new Token_1.Token(Token_1.TokenType.RBracket, blob, lineNum)], e: null };
        }
        else {
            //Blob did not match any valid tokens, but may contain valid tokens
            //ex: intx -> [int, x]
            //Check match for keywords
            if (blob.match(Token_1.TokenRegex.Keywords)) {
                //If there are keywords, split string by them and longest match the result
                var splitBlob = blob.split(Token_1.TokenRegex.Keywords)
                    .filter(function (def) { return def; });
                var tokenArray = [];
                var result = { t: null, e: null };
                for (var _a = 0, splitBlob_1 = splitBlob; _a < splitBlob_1.length; _a++) {
                    var b = splitBlob_1[_a];
                    //Longest match on new string
                    var result_1 = this.longestMatch(b, lineNum);
                    //If there is no error, keep this token and proceed
                    if (result_1.t) {
                        for (var _b = 0, _c = result_1.t; _b < _c.length; _b++) {
                            var t = _c[_b];
                            tokenArray.push(t);
                        }
                    }
                    else {
                        break;
                    }
                }
                return { t: tokenArray, e: result.e };
            }
            else {
                console.log(blob);
                //If the blob doesn't contain any keywords and reached here it must not be valid
                return { t: null, e: this.error(blob, lineNum) };
            }
        }
    };
    Lexer.prototype.error = function (blob, lineNum) {
        return { lvl: "error", msg: "Unknown token " + blob.trim() + " on line " + lineNum };
    };
    Lexer.prototype.warning = function (m) {
        return { lvl: "warning", msg: m };
    };
    return Lexer;
}());
exports.Lexer = Lexer;

},{"./Token":2}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Token = /** @class */ (function () {
    function Token(kind, value, lineNum) {
        this.kind = kind;
        this.value = value;
        this.lineNum = lineNum;
    }
    return Token;
}());
exports.Token = Token;
//Master list of available token types
var TokenType;
(function (TokenType) {
    TokenType["EOP"] = "EOP";
    TokenType["While"] = "While";
    TokenType["If"] = "If";
    TokenType["Print"] = "Print";
    TokenType["VarType"] = "VarType";
    TokenType["BoolLiteral"] = "BoolLiteral";
    TokenType["Id"] = "Id";
    TokenType["Char"] = "Char";
    TokenType["Digit"] = "Digit";
    TokenType["LParen"] = "LParen";
    TokenType["RParen"] = "RParen";
    TokenType["Quote"] = "Quote";
    TokenType["LBracket"] = "LBracket";
    TokenType["RBracket"] = "RBracket";
    TokenType["Assign"] = "Assign";
    TokenType["BoolOp"] = "BoolOp";
    TokenType["IntOp"] = "IntOp";
})(TokenType = exports.TokenType || (exports.TokenType = {}));
//Used  to calculate starting colNum of a token
//Not used right now, leaving just in case
exports.TokenGlyphs = {
    "EOP": "$",
    "While": "while",
    "If": "if",
    "Print": "print",
    "Id": ""
};
exports.TokenRegex = {
    //Break on characters -> digits -> "any/*text*/" -> /*comments*/ -> symbols and new lines
    Split: new RegExp(/([a-z]+)|([0-9])|("[\s|\S]*")|(\/\*.*\*\/)|(=|==|!=|\$|{|}|\(|\)|\+|\s)/g),
    WhiteSpace: new RegExp(/^(\s)$/g),
    //Match any keyword first, then valid ids after
    Keywords: new RegExp(/(int|boolean|string|while|print|if|true|false|[a-z])/g),
    Comment: new RegExp(/^\/\*.*\*\/$/),
    EOP: new RegExp(/(^|\s)[$]($|\s)/),
    While: new RegExp(/(^|\s)while($|\s)/),
    If: new RegExp(/(^|\s)if($|\s)/),
    Print: new RegExp(/(^|\s)print($|\s)/),
    VarType: new RegExp(/(^|\s)(int|boolean|string)($|\s)/g),
    BoolLiteral: new RegExp(/(^|\s)(true|false)($|\s)/),
    Id: new RegExp(/^[a-z]$/),
    Quote: new RegExp(/(".*)/g),
    Char: new RegExp(/[a-z]/),
    Digit: new RegExp(/^[0-9]$/),
    LParen: new RegExp(/(\()/),
    RParen: new RegExp(/(\))/),
    LBracket: new RegExp(/({)/),
    RBracket: new RegExp(/(})/),
    Assign: new RegExp(/(=)/),
    BoolOp: new RegExp(/(==)|(!=)/),
    IntOp: new RegExp(/(\+)/)
};

},{}],3:[function(require,module,exports){
const programs = [
{
    "name": "Example",
    "source": 
`/*Full Grammar*/
{
    int x
    x =0
    int y
    y= 6 

    while(x != y) {
        print(x)
        x = x + 1
        if(x == 3) {
            print("fizz")
        }
        if (x==5) {
            print("buzz")
        }

    }
}$
`,
    "type":null
},
{
    "name": "EOP Warning",
    "source":
`/*Missing EOP Warning*/
{
    int x
}
`,
    "type": "warning"
},
{
    "name": "Invalid Token",
    "source": 
`/*Invalid Token Error*/
{
    int y
    y = 3
    print(y * 2)
} $
`,
    "type": "error"
},
{
    "name":"Multiple Programs",
    "source":
`/*Multiple Programs*/
{
    int x
} $ {
    int y
} $
`,
    "type": null
},
{
    "name":"Lex Edge Cases",
    "source":
`/*Lex Edge Cases*/
"a /*b*/ c"
"int x"
int intel
intintel
"ab
`,
    "type": "warning"
},

{
    "name":"Fast Inverse Square Root",
    "source":
`/*Fast Inverse Square Root*/
float Q_rsqrt( float number )
{
	long i;
	float x2, y;
	const float threehalfs = 1.5F;

	x2 = number * 0.5F;
	y  = number;
	i  = * ( long * ) &y;                       // evil floating point bit level hacking
	i  = 0x5f3759df - ( i >> 1 );               // what the f***? 
	y  = * ( float * ) &i;
	y  = y * ( threehalfs - ( x2 * y * y ) );   // 1st iteration
//	y  = y * ( threehalfs - ( x2 * y * y ) );   // 2nd iteration, this can be removed

    return y;
`,
    "type":"error"
}
];
module.exports = {
    programs: programs
}

},{}],4:[function(require,module,exports){
var example  = require('./examples');
const programs = example.programs;
const LexerModule = require('../dist/Lexer.js');
var editor;
window.onload = function() {
    setupAceEditor();
    setupMemoryGauge();
    setupProgramList();

    //Compile Code
    window.compileCode = this.compileCode;
}
compileCode = function() {
    //Don't run if editor is empty
    if(editor.getValue().trim() == ""){
        return;
    } 
    clearTabsAndErrors();
    $("#log-text").html("Starting Lexer...\n");
    //Safe way to track time, supported on newer browsers
    let start =  window.performance.now();

    const lexer = new LexerModule.Lexer();
    //result :: {t:Token[], e:{lvl:string, msg:string} | null} | null
    const result = lexer.lex(editor.getValue());


    let time = window.performance.now()-start;

    const tokens = result.t;
    //Append messages for whatever tokens are available
    for(var i = 0; i < tokens.length; i++) {
        let text = "[LEXER] => "+tokens[i].kind+" ["+tokens[i].value+"] on line: "+tokens[i].lineNum+"\n";
        tabOutput("lexer",text);
        if(tokens[i].kind == "EOP") {
            $("#lexer-text").append("\n");
        }
    }
    //If there was an error report it and color it based on level
    if (result.e) {
        let errorMsg = $("<span></span>").append("[LEXER] => "+result.e.lvl+": "+result.e.msg+"\n")
            .addClass(statusColor(result.e.lvl));
        applyFilter($("#compile-img"), result.e.lvl);
        
        logError("lexer", errorMsg);
        $("#tab-head-two").addClass(statusColor(result.e.lvl));
    } else {
        applyFilter($("#compile-img"), 'default');
    }

    logOutput("lexer", "[LEXER] => Completed in: "+time.toFixed(2)+" ms");

    //Go back to editor when complete
    editor.focus();
}

/*
Working program, blue or green?
const greenFilter = "hue-rotate(220deg)";
const blueFilter = "hue-rotate(310deg)";
*/
const filters = {
    "warning": "hue-rotate(110deg)",
    "error": "hue-rotate(78deg)",
    "neutral": "hue-rotate(220deg)",
    "default": "hue-rotate(0deg)"
}
applyFilter = function(element, color) {
    $(element).css("filter", randomFilter()).delay(750).queue(function(next) {
            $(this).css("filter", filters[color]);
            next();
    });
}
applyRandomFilter = function(element) {
    $(element).css("filter", randomFilter());
}
randomFilter = function() {
    return "hue-rotate("+(160+Math.floor(Math.random()*200))+"deg)";
}

tabOutput = function (target, text) {
    let element = "#"+target+"-text";
    $(element).append(text);
}
logOutput = function (target, text) {
    let element = "#"+target+"-text";
    $(element).append(text);
    $("#log-text").append(text);
}
logError = function (target, obj) {
    let element = "#"+target+"-text";
    $(element).append(obj);
    $("#log-text").append(obj.clone());
}
statusColor = function (type) {
    return 'compile-'+type;
}
clearTabsAndErrors = function(){
    //Lexer
    $("#lexer-text").html("");
    $("#tab-head-two").removeClass( function(index, className) {
        return (className.match(/(compile-error|compile-warning)/g)||[]).join(' ');
    });
}

loadProgram = function(index) {
    editor.setValue(""+programs[index].source,1);
}

setupAceEditor = function() {
    //Setup Ace editor
    editor = ace.edit("editor");
    editor.setFontSize(16);
    editor.setTheme("ace/theme/dracula");
    editor.getSession().setMode("ace/mode/javascript");
    editor.getSession().setOptions({useSoftTabs: true});
    editor.getSession().setUseWorker(false);
    editor.setShowPrintMargin(false);
    editor.$blockScrolling = Infinity;
    //Vim Mode toggling
    editorMode = "default";
    window.toggleEditorMode = function (btn) {
        if (editorMode === "default") {
            editor.setKeyboardHandler("ace/keyboard/vim");
            editorMode = "vim";
            $("#mode-toggle-button").text("Editor Mode: Vim");
        } else {
            editor.setKeyboardHandler("");
            editorMode = "default";
            $("#mode-toggle-button").text("Editor Mode: Default");
        }
        editor.focus();
    }
}
setupMemoryGauge = function () {
    //Setup Memory gauge for machine code
    var gauge = new JustGage({
        id: "memory-gauge",
        value: getRandomInt(0, 256), //test
        min: 0,
        max: 256, //Replace with real max byte
        height:160,
        width:180,
        gaugeColor: "#44475a",
        levelColors: ["#bd93f9", "#ff5555"],
        title:"Bytes used",
        titleFontColor: "#f8f8f2",
        titleFontFamily: 'monospace',
        valueFontColor: "#f8f8f2",
        valueFontFamily: 'monospace'
    });
    //Just for testing gauge
    setInterval(function() { gauge.refresh(getRandomInt(0,256))}, 2000);

}
setupProgramList = function() {
    //Setup clickable Example Program List
    programs.forEach(element => {
        let item = $("<span class='dropdown-item'></span")
            .html(element.name)
            .css("cursor", "pointer")
            .on('click', function() {editor.setValue(""+element.source, 1)});
        if(element.type != null) {
            item.addClass(statusColor(element.type))
        }
        $(".dropdown-menu").append(item);
    });

}

},{"../dist/Lexer.js":1,"./examples":3}]},{},[4]);
