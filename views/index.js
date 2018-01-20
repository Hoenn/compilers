(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function greeter(person) {
    return 'Hello ' + person + ' !!';
}
exports.greeter = greeter;

},{}],2:[function(require,module,exports){
var editor = ace.edit("editor");
editor.setTheme("ace/theme/dracula");
editor.getSession().setMode("ace/mode/javascript");
editor.getSession().setUseWorker(false);
editor.setShowPrintMargin(false);


editorMode = "default";
window.toggleEditorMode = function (btn) {
    if (editorMode === "default") {
        editor.setKeyboardHandler("ace/keyboard/vim");
        editorMode = "vim";
        document.getElementById("modeToggleButton").textContent="Editor Mode: Vim";
    } else {
        editor.setKeyboardHandler("");
        editorMode = "default";
        document.getElementById("modeToggleButton").textContent="Editor Mode: Default";
    }
}

var testBrowserify = require("../dist/greet");
console.log(testBrowserify.greeter("Evan!"));
},{"../dist/greet":1}]},{},[2]);
