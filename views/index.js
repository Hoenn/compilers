(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

//Setup Memory gauge for machine code
var gauge = new JustGage({
    id: "memory-gauge",
    value: getRandomInt(0, 256), //test
    min: 0,
    max: 256, //Replace with real max byte
    gaugeColor: "#44475a",
    levelColors: ["#bd93f9"],
    title:"Bytes used",
    titleFontColor: "#f8f8f2",
    valueFontColor: "#f8f8f2"
});
//Just for testing
setInterval(function() { gauge.refresh(getRandomInt(0,256))}, 2000);
},{}]},{},[1]);
