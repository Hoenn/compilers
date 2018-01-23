(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Lexer = /** @class */ (function () {
    function Lexer() {
    }
    Lexer.lex = function (src) {
        //Return output of actual lex which will be
        //Preformatted output of:
        ////Ordered List of Tokens
        /////Which Token Where Summary
        ///List of Warnings and Errors
        //Example output
        //{
        // int x = 5
        //}
        //$
        return "LEXER: { on Line 1 \n\n        LEXER: int on Line 2 \n\n        LEXER: x on Line 3 \n\n        LEXER: = on Line 2 \n\n        LEXER: 5 on Line 2 \n\n        LEXER: } on Line 3 \n\n        Lexer: $ on Line 4 \n";
    };
    return Lexer;
}());
exports.Lexer = Lexer;

},{}],2:[function(require,module,exports){
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

var Lexer = require('../dist/Lexer.js').Lexer;
window.compileCode = function() {
    $('#log-text').append(Lexer.lex(editor.getValue())+"\n");
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

},{"../dist/Lexer.js":1}]},{},[2]);
