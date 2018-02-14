export class SyntaxTree {
    current: Node;
    root: Node;
    constructor(n : Node) {
        this.root = n;
        this.current = this.root;
    }
    addBranchNode(n: Node) {
        //Maybe refactor to construct a node here
        //Set the parent of new Node
        n.parent = this.current;
        //Add new node to current child list
        this.current.addChild(n);
        //Update current to new node
        this.current = n;
    }
    addLeafNode(n: Node) {
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
        function expand(node:Node, depth: number) {
            //Add indentation
            for(let i = 0; i < depth; i++){
                result+="-";
            }
            if(node.children.length === 0){
                result+= "["+node.name+"]";
                result+="\n";
            } else {
                result+= "<"+node.name+">\n";
                for(let i = 0; i < node.children.length; i ++){
                    expand(node.children[i], depth+1);
                }
            }
        }
        expand(this.root, 0);
        return result;
    }
    
}
export class Node {
    name: string;
    parent: Node | null;
    value: string;
    children: Node[];

    constructor(n:string, p: Node | null, v: string) {
        this.name = n;
        this.parent = p;
        this.children = [];
        this.value = v;
    }
    addChild(n: Node) {
        this.children.push(n);
    }
}