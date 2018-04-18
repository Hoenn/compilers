export class Heap {
    data: string[];
    heapPointer = 256;
    constructor() {
        this.data = [];
    }
    add(s: string): string {
        let hexArr = this.convertToNullTerminatedHexString(s);
        for(let i = 0; i < hexArr.length; i++) {
            this.data.unshift(hexArr[i]);
        }
        this.heapPointer = this.heapPointer - hexArr.length ;
        return this.heapPointer.toString();
    }
    convertToNullTerminatedHexString(s: string): string[] {
        let result = [];
        result.push("00");
        for(let i = 0; i < s.length; i++) {
            result.push(this.strToHex(s.charAt(i)));
        }
        //Null terminate
        return result;
    }
    strToHex(s: string): string {
        return s.charCodeAt(0).toString(16);
    }
}