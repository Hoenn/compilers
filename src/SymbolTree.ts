export class SymbolTree { 
    current: ScopeNode;
    root: ScopeNode;
    constructor(n : ScopeNode) {
        this.root = n;
        this.current = this.root;
        //Reset global node count on construction
        count = 0;
    }
    addBranchNode(n: ScopeNode) {
        //Maybe refactor to construct a node here
        //Set the parent of new Node
        n.parent = this.current;
        //Add new node to current child list
        this.current.addChild(n);
        //Update current to new node
        this.current = n;
    }
    addLeafNode(n: ScopeNode) {
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
        function expand(node: ScopeNode, depth: number) {
            for(let i=0; i < depth; i++) {
                result+=" ";
            }
            result+="+\n"
            for(let id in node.stash) {
                //Indent in
                for(let i = 0; i < depth; i++){
                    result+=" ";
                }
                result+= "| ";
                let v = node.stash[id];
                result += id+" type: "+v.type+" line: "+v.line+" init: "+v.init+" used: "+v.used+" scopeId: "+v.scopeId+"\n";
            }
            if(node.children.length !== 0){
                for(let i = 0; i < node.children.length; i ++){
                    expand(node.children[i], depth+1);

                }
            }
        }
        expand(this.root, 0);
        return result;
    }
    clean() {
        this.root = this.root.children[0];
    }
}

var count = 0;
export class ScopeNode {
    
    parent: ScopeNode | null;
    children: ScopeNode[];
    stash: {[key:string]: {"type": string, "line": number, "init": boolean, "used": boolean, "scopeId": number}};
    scopeId: number;
    constructor(){
        this.stash = {};
        this.children = [];
        this.parent = null;
        this.scopeId = count++;
    }
    addChild(n: ScopeNode) {
        this.children.push(n);
    }
    addStash(id: string, t: string, l: number): boolean{
        if(this.stash[id]) {
            //Collision
            return false;
        } else {
            this.stash[id] = {"type": t, "line": l, "init": false, "used": false, "scopeId": this.scopeId };
            return true;
        }
    }
    stashEntryToString(id: string): string {
        let entry = this.stash[id];
        if(!entry)
            return "";
        return entry.type + " " +id+" on line: "+ entry.line;
    }
    initStashed(id:string): boolean{
        let entry = this.stash[id];
        if(!entry)
            return false;
        entry.init = true;
        return true;
    }
    usedStashed(id:string): boolean {
        let entry = this.stash[id];
        if(!entry)
            return false;
        entry.used = true;
        return true;

    }
}