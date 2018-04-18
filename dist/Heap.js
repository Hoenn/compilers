"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Heap = /** @class */ (function () {
    function Heap() {
        this.heapPointer = 256;
        this.data = [];
    }
    Heap.prototype.add = function (s) {
        var hexArr = this.convertToNullTerminatedHexString(s);
        for (var i = 0; i < hexArr.length; i++) {
            this.data.unshift(hexArr[i]);
        }
        this.heapPointer = this.heapPointer - hexArr.length;
        return this.heapPointer.toString();
    };
    Heap.prototype.convertToNullTerminatedHexString = function (s) {
        var result = [];
        result.push("00");
        for (var i = 0; i < s.length; i++) {
            result.push(this.strToHex(s.charAt(i)));
        }
        //Null terminate
        return result;
    };
    Heap.prototype.strToHex = function (s) {
        return s.charCodeAt(0).toString(16);
    };
    return Heap;
}());
exports.Heap = Heap;
