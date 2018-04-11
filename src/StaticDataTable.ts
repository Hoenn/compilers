import {Node} from "./SyntaxTree";
export class StaticDataTable{
    currentAddress : number; 
    //id name, scope level, 
    variables: {[key:string]: number}
    constructor() {
        //Current address starts at 3 since there are two temporary variables
        this.currentAddress = 3;
        this.variables = {};
    }
    add(n: Node) {
        this.currentAddress++;
        this.variables[n.name];

    }

}