export class SymbolTree { 
    current: SymbolNode;
    root: SymbolNode;
    constructor(n : SymbolNode) {
        this.root = n;
        this.current = this.root;
    }
    addBranchNode(n: SymbolNode) {
        //Maybe refactor to construct a node here
        //Set the parent of new Node
        n.parent = this.current;
        //Add new node to current child list
        this.current.addChild(n);
        //Update current to new node
        this.current = n;
    }
    addLeafNode(n: SymbolNode) {
        n.parent = this.current;
        this.current.addChild(n);
    }
    moveCurrentUp() {
        //If it has a parent move it up
        if (this.current.parent) {
            this.current = this.current.parent;
        }
    }
    toString() : string {
        let result = "";
        function expand(node:SymbolNode, depth: number) {
            for(let id in node.stash) {
                //Indent in
                for(let i = 0; i < depth; i++){
                    result+="-";
                }
                let v = node.stash[id];
                result += id+" type: "+v.type+" line: "+v.line+"\n";
            }
            if(node.children.length === 0){
                result+="\n";
            } else {
                for(let i = 0; i < node.children.length; i ++){
                    expand(node.children[i], depth+1);
                }
            }
        }
        expand(this.root, 0);
        return result;
    }
}
export class SymbolNode {
    parent: SymbolNode | null;
    init: boolean;
    used: boolean;
    children: SymbolNode[];
    stash: {[key:string]: {"type": string, "line": number}};

    constructor(){
        this.init = false;
        this.used = false;
        this.stash = {};
        this.children = [];
        this.parent = null;
    }
    addChild(n: SymbolNode) {
        this.children.push(n);
    }
}