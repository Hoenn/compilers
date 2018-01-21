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
    levelColors: ["#bd93f9", "#ff5555"],
    title:"Bytes used",
    titleFontColor: "#f8f8f2",
    titleFontFamily: 'monospace',
    valueFontColor: "#f8f8f2",
    valueFontFamily: 'monospace'
});
//Just for testing
setInterval(function() { gauge.refresh(getRandomInt(0,256))}, 2000);