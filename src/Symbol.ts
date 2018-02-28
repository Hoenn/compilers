export class Symbol {
    id: string;
    type: string;
    //scopeLevel :number;
    line: number;
    constructor(id: string, type: string,  line: number) {
        this.id = id;
        this.type = type;
        this.line = line;
    }
    toString():string {
        return "[ id: "+this.id+" type: "+this.type+" line: "+ this.line+"]";
    }
}