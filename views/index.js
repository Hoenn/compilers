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
        var tokenBlob = src.split(Token_1.TokenRegex.Split).filter(function (defined) { return defined; });
        var lineNum = 1;
        var tokens = [];
        for (var _i = 0, tokenBlob_1 = tokenBlob; _i < tokenBlob_1.length; _i++) {
            var blob = tokenBlob_1[_i];
            //If newline is found increment lineNum but skip
            //If a comment or whitespace just skip
            if (blob.match("\n")) {
                lineNum += 1;
                continue;
            }
            else if (blob.match(Token_1.TokenRegex.Comment) || blob.match(Token_1.TokenRegex.WhiteSpace)) {
                continue;
            }
            var result = this.longestMatch(blob, lineNum);
            if (result.t) {
                for (var _a = 0, _b = result.t; _a < _b.length; _a++) {
                    var t = _b[_a];
                    tokens.push(t);
                }
            }
            if (result.e) {
                console.log(result.e);
                break;
            }
        }
        console.log(tokens);
        return tokens;
    };
    Lexer.prototype.longestMatch = function (blob, lineNum) {
        if (Token_1.TokenRegex.While.test(blob)) {
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
        else if (Token_1.TokenRegex.Quote.test(blob)) {
            var splitQuote = blob.split("");
            console.log(blob);
            console.log(splitQuote);
            var tokenArray = [];
            for (var _i = 0, splitQuote_1 = splitQuote; _i < splitQuote_1.length; _i++) {
                var char = splitQuote_1[_i];
                if (char === "\"") {
                    tokenArray.push(new Token_1.Token(Token_1.TokenType.Quote, char, lineNum));
                }
                else if (char.match(/[a-z]/g)) {
                    tokenArray.push(new Token_1.Token(Token_1.TokenType.Char, char, lineNum));
                }
                else {
                    return { t: tokenArray, e: "Unknown lexeme " + char + " on " + lineNum };
                }
            }
            return { t: tokenArray, e: null };
        }
        else if (Token_1.TokenRegex.LBracket.test(blob)) {
            return { t: [new Token_1.Token(Token_1.TokenType.LBracket, blob, lineNum)], e: null };
        }
        else if (Token_1.TokenRegex.RBracket.test(blob)) {
            return { t: [new Token_1.Token(Token_1.TokenType.RBracket, blob, lineNum)], e: null };
        } //Handle the case of no match by breaking on keywords
        return { t: null, e: "errormsg" };
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
    TokenType["CharList"] = "CharList";
    TokenType["Integer"] = "Integer";
    TokenType["Equals"] = "Equals";
    TokenType["NotEquals"] = "NotEquals";
    TokenType["LParen"] = "LParen";
    TokenType["RParen"] = "RParen";
    TokenType["Quote"] = "Quote";
    TokenType["LBracket"] = "LBracket";
    TokenType["RBracket"] = "RBracket";
    TokenType["Assign"] = "Assign";
    TokenType["Addition"] = "Addition";
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
    Split: new RegExp(/([a-z]+)|([0-9]+)|(".*")|(\/\*.*\*\/)|(=|==|!=|\$|{|}|\+|\n)/g),
    WhiteSpace: new RegExp(/\s/g),
    Comment: new RegExp(/\/\*.*\*\//),
    EOP: new RegExp(/(^|\s)[$]($|\s)/),
    While: new RegExp(/(^|\s)while($|\s)/),
    If: new RegExp(/(^|\s)if($|\s)/),
    Print: new RegExp(/(^|\s)print($|\s)/),
    VarType: new RegExp(/(^|\s)(int|boolean|string)($|\s)/),
    BoolLiteral: new RegExp(/(^|\s)(true|false)($|\s)/),
    Id: new RegExp(/^[a-z]$/),
    Quote: new RegExp(/(".*)/g),
    Char: new RegExp(/[a-z]/),
    CharList: new RegExp(/[a-z][a-z\s]+/),
    Integer: new RegExp(/[0-9]/),
    Equals: new RegExp(/[==]/),
    NotEquals: new RegExp(/[!=]/),
    LParen: new RegExp(/[(]/),
    RParen: new RegExp(/[)]/),
    LBracket: new RegExp(/[{]/),
    RBracket: new RegExp(/[}]/),
    Assign: new RegExp(/[=]/),
    Addition: new RegExp(/[+]/)
};

},{}],3:[function(require,module,exports){
//Setup Ace editor
var editor = ace.edit("editor");
editor.setTheme("ace/theme/dracula");
editor.getSession().setMode("ace/mode/javascript");
editor.getSession().setUseWorker(false);
editor.setShowPrintMargin(false);

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
}

const LexerModule = require('../dist/Lexer.js');
window.compileCode = function() {
    const lexer = new LexerModule.Lexer();
    $('#log-text').append(lexer.lex(editor.getValue())+"\n");
}

//Setup Memory gauge for machine code
var gauge = new JustGage({
    id: "memory-gauge",
    value: getRandomInt(0, 256), //test
    min: 0,
    max: 256, //Replace with real max byte
    gaugeColor: "#44475a",
    levelColors: ["#bd93f9", "#ff5555"],
    title:"Bytes used",
    titleFontColor: "#f8f8f2",
    titleFontFamily: 'monospace',
    valueFontColor: "#f8f8f2",
    valueFontFamily: 'monospace'
});
//Just for testing
setInterval(function() { gauge.refresh(getRandomInt(0,256))}, 2000);


////D3 for AST, Might not be worth the extra work
//var svg = d3.select("#ast-graph")
//    .append("svg")
//    .attr("width", "100%")
//    .attr("height", "100%")
//    .call(d3.zoom().on("zoom", function() {
//        svg.attr("transform",d3.event.transform) 
//    }))
//    .append("g");
//
//    svg.append("circle")
//        .attr("cx", 100)
//        .attr("cy", $("#ast-graph").height())
//        .attr("r", 20)
//        .style("fill", "#b9d334");
//console.log($("#ast-graph").width());

},{"../dist/Lexer.js":1}]},{},[3]);
