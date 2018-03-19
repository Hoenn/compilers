export class Symbol {
    id: string;
    type: string;
    scopeLevel :number;
    line: number;
    constructor(id: string, type: string, scope: number, line: number) {
        this.id = id;
        this.type = type;
        this.line = line;
        this.scopeLevel = scope;
    }
    toString():string {
        return "[ id: "+this.id+" type: "+this.type+" scope level: "+this.scopeLevel+" line: "+ this.line+"]";
    }
}