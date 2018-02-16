"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function error(errMsg, lineNum) {
    return { lvl: "error", msg: errMsg + (lineNum ? " on line " + lineNum : "") };
}
exports.error = error;
function warning(m) {
    return { lvl: "warning", msg: m };
}
exports.warning = warning;
