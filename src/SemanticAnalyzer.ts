import {SyntaxTree, AbstractNode, Node} from "./SyntaxTree";
import {SymbolTree, ScopeNode} from "./SymbolTree";

export class SemanticAnalyzer {
    ast: SyntaxTree;
    st: SymbolTree;
    log: string[]
    constructor(ast: SyntaxTree) {
        this.ast = ast;
        this.st = new SymbolTree(new ScopeNode());
        this.log = [];
    }
    analyze(): {ast: SyntaxTree, st: SymbolTree, log: string[]}{
        //Ensure current is set to root
        this.ast.current = this.ast.root;

        this.analyzeNext(this.ast.root);

        //Pass the symbol tree for unused variables
        this.emit("Unused " + this.checkForUnusedVariables(this.st.root).join(","));
        return {ast:this.ast, st: this.st, log: this.log};
    }
    analyzeNext(n: Node) {
        if(n.children.length == 0){
            return;
        }
        switch (n.name) {
            case "Block": {
                this.analyzeBlock(n);
                break;
            }
            case "VarDecl": {
                this.analyzeVarDecl(n);
                break;
            }
            case "Print": {
                this.analyzePrint(n);
                break;
            }
            case "Assignment": {
                this.analyzeAssignment(n);
                break;
            }
            case "While": {
                this.analyzeWhile(n);
                break;
            }
            default: return;
        }
    }
    analyzeBlock(n: Node) {
        this.emit("Block");
        //Add new scope level
        this.st.addBranchNode(new ScopeNode());
        for(let i = 0; i < n.children.length; i++) {
            this.analyzeNext(n.children[i]);
        }
        this.st.moveCurrentUp();
    }
    analyzeVarDecl(n: Node) {
        this.emit("VarDecl");
        let type = n.children[0].name;
        let id = n.children[1].name;
        let success = this.st.current.addStash(id, type, 0);
        if(!success) {
            this.emit("Redeclared variable");
            //Warning instead;
        }
    }
    analyzePrint(n: Node) {
        this.emit("Print");
        //Type checking will throw errors about undeclared variables within
        //any Expr
        if(!this.typeCheck(n.children[0], "")) {
            this.emit("type mismatch");
        }
    }
    analyzeAssignment(n: Node) {
        let id = n.children[0].name;
        let found = this.st.current.stash[id];
        if(found){
            this.emit("Initialized Variable")
            this.st.current.initStashed(id);
        } else {
            this.emit("Undeclared variable")
        }
        let expr = n.children[1];
        let success = this.typeCheck(expr, found.type);
        if(success) {
            this.emit("Types match");
        } else {
            this.emit("Type mismatch")
            //Error instead;
        }
    }
    analyzeWhile(n: Node) {

    }
    typeCheck(n: Node, type: string): boolean {
        //Must be a terminal symbol
        if(n.children.length == 0) {
            //0-9: int
            //true || false: boolean
            //[a-z] length >1 : string
            //[a-z]: id of some type
            if(parseInt(n.name)){
                return type == "int";
            } else if(n.name == "true" || n.name == "false") {
                return type == "boolean";
            } else if(n.name.length > 1) {
                return type == "string";
            } else {
                //Must be id
                let idType = this.typeOf(n.name);
                if(idType) {
                    return type == idType;
                } else {
                    this.emit("Undeclared variable")
                    return false;
                }
            }
        } else {
            //If only valid non terminals (branches) in AST 
            //are IntOp and BoolOp nodes, their children must
            //match in type completely so we no longer need
            //the original type parameter
            if(n.name == "+"){
                return this.typeCheck(n.children[0], "int") && this.typeCheck(n.children[1], "int");
            } else { // == !=
                return this.typeCheck(n.children[0], "boolean") && this.typeCheck(n.children[1], "boolean");
            }
        }
    }

    typeOf(id: string): string|null {
        let current: ScopeNode|null = this.st.current
        while(current != null){
            if(current.stash[id]){
                //If checking the type of some variable, it must
                //be in a context that indicates it's being used
                current.usedStashed(id);
                return current.stash[id].type;
            }
            current = current.parent;
        }
        //If we dont find the variable up the SymbolTree
        //Undeclared variable error
        return null;
    }
    analyzeExpr(n: Node) {
        //Likely not needed
    }
    emit(s: string) {
        this.log.push("Analyzing "+s);
    }
    
    checkForUnusedVariables(n: ScopeNode):string[] {
       let unused: string[] = [];
       
       let traverse =(node: ScopeNode) => {
            unused = unused.concat(this.checkForUnusedVariablesHelper(node));
            if(node.children.length > 0){
                for(let i = 0; i < node.children.length; i++) {
                    traverse(node.children[i]);
                }
            }
       } 
       traverse(n);
       return unused;
        
    }
    checkForUnusedVariablesHelper(n : ScopeNode): string[] {
        let arr = [];
        //Check current scope node
        for(let id in n.stash){
            if(!n.stash[id].used) {
                arr.push(n.stashEntryToString(id));
            }
        }
        return arr;
    }
}