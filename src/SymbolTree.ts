export class SymbolTree { 
    current: ScopeNode;
    root: ScopeNode;
    constructor(n : ScopeNode) {
        this.root = n;
        this.current = this.root;
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
            for(let id in node.stash) {
                //Indent in
                for(let i = 0; i < depth; i++){
                    result+="-";
                }
                result+= " ";
                let v = node.stash[id];
                result += id+" type: "+v.type+" line: "+v.line+"\n";
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
}
export class ScopeNode {
    parent: ScopeNode | null;
    children: ScopeNode[];
    stash: {[key:string]: {"type": string, "line": number, "init": boolean, "used": boolean}};

    constructor(){
        this.stash = {};
        this.children = [];
        this.parent = null;
    }
    addChild(n: ScopeNode) {
        this.children.push(n);
    }
    addStash(id: string, t: string, l: number): boolean{
        if(this.stash[id]) {
            //Collision
            return false;
        } else {
            this.stash[id] = {"type": t, "line": l, "init": false, "used": false};
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