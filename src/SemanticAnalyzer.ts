import {SyntaxTree, Node} from "./SyntaxTree";
import {SymbolTree, ScopeNode} from "./SymbolTree";
import {Alert, error, warning} from "./Alert";

export class SemanticAnalyzer {
    ast: SyntaxTree;
    st: SymbolTree;
    warnings: Alert[];
    log: string[]
    constructor(ast: SyntaxTree) {
        this.ast = ast;
        this.st = new SymbolTree(new ScopeNode());
        this.log = [];
        this.warnings = []
    }
    analyze(): {ast: SyntaxTree, st: SymbolTree, log: string[], warnings: Alert[], error: Alert |null}{
        //Ensure current is set to root
        this.ast.current = this.ast.root;

        let err = this.analyzeNext(this.ast.root);

        //Pass the symbol tree for unused variables
        if(!err) {
            this.warnings = this.warnings.concat(this.checkForUnusedVariables(this.st.root));
        }
        return {ast:this.ast, st: this.st, log: this.log, warnings: this.warnings, error: err};
    }
    analyzeNext(n: Node): Alert | null {
        let err = null;
        switch (n.name) {
            case "Block": {
                err = this.analyzeBlock(n);
                break;
            }
            case "VarDecl": {
                err = this.analyzeVarDecl(n);
                break;
            }
            case "Print": {
                err =this.analyzePrint(n);
                break;
            }
            case "Assignment": {
                err =this.analyzeAssignment(n);
                break;
            }
            case "While": {
                err = this.analyzeWhile(n);
                break;
            }
            case "If": {
                err = this.analyzeIf(n);
                break;
            }
            default: {
                //Should not reach here
                this.emit("Should not reach here");
            }
        }
        return err;
    }
    analyzeBlock(n: Node): Alert | null {
        this.emit("Block");
        //Add new scope level
        let err = null;
        this.st.addBranchNode(new ScopeNode());
        for(let i = 0; i < n.children.length; i++) {
            err = this.analyzeNext(n.children[i]);
            if(err) {
                break;
            }
        }
        this.st.moveCurrentUp();
        return err;
    }
    analyzeVarDecl(n: Node):Alert | null {
        this.emit("VarDecl");
        let type = n.children[0].name;
        let id = n.children[1].name;
        let success = this.st.current.addStash(id, type, n.lineNum? n.lineNum: -1);
        let err = null;
        if(!success) {
            this.emit("Redeclared variable");
            err = error("Redeclared variable: "+id+" on line "+n.lineNum);

        }
        return err;
    }
    analyzePrint(n: Node): Alert | null {
        this.emit("Print");
        //Type checking will throw errors about undeclared variables within
        //any Expr
        let type = this.typeOf(n.children[0].name);
        if(type == "id"){
            let temp = this.typeOfId(n.children[0]);
            if(typeof(temp) == "string"){
                type = temp;
            } else {
                return temp;
            }
        }
        let err = this.typeCheck(n.children[0], type )
        if(err) {
            this.emit("type mismatch");
        }
        return err;
    }
    analyzeAssignment(n: Node): Alert | null {
        this.emit("Assignment");
        let id = n.children[0].name;
        let type = this.typeOfId(n.children[0]);
        if(typeof(type) == "string"){
            this.emit("Initialized Variable")
            this.st.current.initStashed(id);
        } else {
            return type;
        }
     
        let expr = n.children[1];
        let err = this.typeCheck(expr, type );
        if(err) {
            this.emit("Type mismatch")
            return err;
        } else {
            this.emit("Types match");
            
        }
        return err;
    }
    analyzeWhile(n: Node): Alert | null {
        this.emit("While");
        let boolExpr = n.children[0];
        let err = this.typeCheck(boolExpr, "boolean");
        if(err){
            this.emit("type mismatch");
            return err;
        }
        this.analyzeBlock(n.children[1]);
        return err;

    }
    analyzeIf(n: Node): Alert|null {
        this.emit("If");
        let boolExpr = n.children[0];
        let err = this.typeCheck(boolExpr, "boolean");
        if(err){
            this.emit("type mismatch");
            return err;
        }
        this.analyzeBlock(n.children[1]);
        return err;
    }
    typeCheck(n: Node, type: string): Alert | null {
        //Must be a terminal symbol
        if(n.children.length == 0) {
            //0-9: int
            //true || false: boolean
            //[a-z] length >1 : string
            //[a-z]: id of some type
            let actual = this.typeOf(n.name);
            if(actual == "int"){
                return (type == "int" ? null : this.typeMismatch(n, type, "int"));
            } else if(actual == "boolean") {
                return (type == "boolean" ? null : this.typeMismatch(n, type, "boolean"));
            } else if(actual == "string") {
                return (type == "string" ? null : this.typeMismatch(n, type, "string"));
            } else {
                //Must be id
                let idType = this.typeOfId(n);
                if(typeof(idType) == "string") {
                    return (type == idType ? null : this.typeMismatch(n, type, idType));
                } else {
                    this.emit("Undeclared variable")
                    return error("Undeclared variable: "+n.name+" on line: "+n.lineNum);
                }
            }
        } else {
            //If only valid non terminals (branches) in AST 
            //are IntOp and BoolOp nodes, their children must
            //match in type completely so we no longer need
            //the original type parameter
            let err = null;
            if(n.name == "+"){
                err = this.typeCheck(n.children[0], "int");
                if(err){
                    return err;
                }
                err = this.typeCheck(n.children[1], "int");
            } else { // == !=
                err = this.typeCheck(n.children[0], "boolean");
                if(err) {
                    return err;
                }
                err = this.typeCheck(n.children[1], "boolean");
            }
                return err;
        }
    }
    typeOf(token: string) :string {
        if(parseInt(token)){
            return "int";
        } else if(token =="true" || token == "false") {
            return "boolean";
        } else if(token.length > 1) {
            return "string";
        } else {
            return "id";
        }
    }
    typeOfId(n: Node): string|Alert {
        let id = n.name
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
        return error("Undeclared variable: "+n.name+" on line: "+n.lineNum);
    }
    analyzeExpr(n: Node) {
        //Likely not needed
    }
    emit(s: string) {
        this.log.push("Analyzing "+s);
    }
    typeMismatch(n: Node, expected: string, actual: string): Alert {
        //Add line num to nodes
        return error("Type mismatch on line: "+n.lineNum+ " expected: "+expected+" but got: "+actual);
    }
    
    checkForUnusedVariables(n: ScopeNode):Alert[] {
       let unused: Alert[] = [];
       
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
    checkForUnusedVariablesHelper(n : ScopeNode): Alert[] {
        let arr = [];
        //Check current scope node
        for(let id in n.stash){
            if(!n.stash[id].used) {
                arr.push(warning("Unused variable: "+n.stashEntryToString(id)));
            }
        }
        return arr;
    }
}