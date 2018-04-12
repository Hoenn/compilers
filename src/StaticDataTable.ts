import {Node} from "./SyntaxTree";
import {SymbolTree, ScopeNode} from "./SymbolTree";
export class StaticDataTable{
    currentAddress : number; 
    variables: {[name:string]: {scope:number, addr: number}};
    constructor() {
        //Current address starts at 3 since there are two temporary variables
        this.currentAddress = 3;
        this.variables = {};
    }
    add(n: Node, scope: number): number {
        let key = n.name+":"+scope;
        this.variables[key] = {scope: 0, addr: 0};
        this.variables[key].scope = scope;
        let addr = this.currentAddress;
        this.variables[key].addr = this.currentAddress;
        this.currentAddress++;
        return addr;
    }
    findAddr(id: string, scope: number): number{
        return this.variables[id+":"+scope].addr;
    }

}