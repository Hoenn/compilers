var editor = ace.edit("editor");
editor.setTheme("ace/theme/dracula");
editor.getSession().setMode("ace/mode/javascript");
editor.getSession().setUseWorker(false);
editor.setShowPrintMargin(false);


editorMode = "default";
function toggleEditorMode(btn) {
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