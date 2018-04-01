import {SyntaxTree, Node} from "./SyntaxTree";
import {SymbolTree, ScopeNode} from "./SymbolTree";
import {Alert, isAlert, error, warning} from "./Alert";

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
    analyze(): {ast: SyntaxTree, st: SymbolTree, log: string[], warnings: Alert[], error: Alert |undefined}{
        //Ensure current is set to root
        this.ast.current = this.ast.root;

        let err = this.analyzeNext(this.ast.root);

        //Pass the symbol tree for unused variables
        if(!err) {
            this.emit("Checking for unused variables");
            this.warnings = this.warnings.concat(this.checkForUnusedVariables(this.st.root));
        }
        this.st.clean()
        return {ast:this.ast, st: this.st, log: this.log, warnings: this.warnings, error: err};
    }
    analyzeNext(n: Node): Alert | undefined {
        let err;
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
            }
        }
        return err;
    }
    analyzeBlock(n: Node): Alert | undefined {
        this.emit("Analyzing Block");
        //Add new scope level
        let err;
        this.emit("Adding new scope level to SymbolTree")
        this.st.addBranchNode(new ScopeNode());
        for(let i = 0; i < n.children.length; i++) {
            err = this.analyzeNext(n.children[i]);
            if(err) {
                return err;
            }
        }
        this.emit("Moving current Scope up one level")
        this.st.moveCurrentUp();
    }
    analyzeVarDecl(n: Node):Alert | undefined {
        this.emit("Analyzing VarDecl");
        let type = n.children[0].name;
        let id = n.children[1].name;
        let success = this.st.current.addStash(id, type, n.lineNum? n.lineNum: -1);
        let err;
        if(!success) {
            this.emit("Found redeclared variable in same scope");
            err = error("Redeclared variable: "+id+" on line: "+n.lineNum);

        }
        this.emit("Adding "+id+" to current scope");
        return err;
    }
    analyzePrint(n: Node): Alert | undefined {
        this.emit("Analyzing Print");
        //Type checking will throw errors about undeclared variables within
        //any Expr
        let type = this.typeOf(n.children[0], false);
        if(isAlert(type)){
            return type;
        }
        
        let err = this.typeCheck(n.children[0], type, true)
        if(err) {
            this.emit("Found type mismatch");
        }
        return err;
    }
    analyzeAssignment(n: Node): Alert | undefined {
        this.emit("Analyzing Assignment");
        let id = n.children[0].name;
        let type = this.typeOfId(n.children[0], false);
        //type: string | Alert
        if(isAlert(type)){
            return type;
        }  
     
        this.emit("Initialized Variable " +id)
        this.st.current.initStashed(id);
        this.initVariable(id);

        let expr = n.children[1];
        let err = this.typeCheck(expr, type, true);
        if(err) {
            this.emit("Found type mismatch")
            return err;
        } else {
            this.emit("Types match");
        }
        return err;
    }
    analyzeWhile(n: Node): Alert | undefined {
        this.emit("Analyzing While");
        let boolExpr = n.children[0];
        let err = this.typeCheck(boolExpr, "boolean", true);
        if(err){
            this.emit("Found type mismatch");
            return err;
        }
        err = this.analyzeBlock(n.children[1]);
        return err;

    }
    analyzeIf(n: Node): Alert|undefined {
        this.emit("Analyzing If");
        let boolExpr = n.children[0];
        let err = this.typeCheck(boolExpr, "boolean", true);
        if(err){
            this.emit("Found type mismatch");
            return err;
        }
        err = this.analyzeBlock(n.children[1]);
        return err;
    }
    /**
     * @param n The node containing expression to be evaluated against
     * @param expected The expected type of expression in n
     * @param used A flag to mark n as used if it is an id
     */
    typeCheck(n: Node, expected: string, used: boolean): Alert | undefined {
        //Must be a terminal symbol
        if(n.children.length == 0) {
            //0-9: int
            //true || false: boolean
            //[a-z] length >1 : string
            //[a-z]: id of some type
            //If types do match, return undefined, if not return an error indicating
            //the expected and actual types
            let actual = this.typeOf(n, used);
            if(actual == "int"){
                return (expected == "int" ? undefined : this.typeMismatch(n, expected, "int"));
            } else if(actual == "boolean") {
                return (expected == "boolean" ? undefined : this.typeMismatch(n, expected, "boolean"));
            } else if(actual == "string") {
                return (expected == "string" ? undefined : this.typeMismatch(n, expected, "string"));
            } else {
                //Must be id
                let idType = this.typeOfId(n, used);
                //idType:string|Alert
                if(isAlert(idType)) {
                    this.emit("Found undeclared variable")
                    return error("Undeclared variable: "+n.name+" on line: "+n.lineNum);
                }
                this.warnIfNotInitialized(n);
                return (expected == idType ? undefined : this.typeMismatch(n, expected, idType));
                
            }
        } else {
            //If only valid non terminals (branches) in AST 
            //are IntOp and BoolOp nodes, their children must
            //match in type completely so we no longer need
            //the original type parameter
            let err;
            if(n.name == "Plus"){
                err = this.typeCheck(n.children[0], "int", used);
                if(err){
                    return err;
                }
                err = this.typeCheck(n.children[1], "int", used);
            } else { // == !=
                let type = this.typeOf(n.children[0], used);
                //There was an error
                if(isAlert(type)) {
                    return type;
                }
                let type2 = this.typeOf(n.children[1], used);
                if(isAlert(type2)) {
                    return type2;
                }
                if(type != type2) {
                    return this.typeMismatch(n, type, type2);
                }
                err = this.typeCheck(n.children[1], type, used);
            }
            return err;
        }
    }
    typeOf(n: Node, used: boolean) :string | Alert {
        let token = n.name
        if(n.isString) {
            return "string";
        }
        else if(!isNaN(parseInt(token)) || token=="Plus"){
            return "int";
        } else if(token =="true" || token == "false") {
            return "boolean";
        } else if(token == "EqualTo" || token =="NotEqualTo") {
            let t1 = this.typeOf(n.children[0], used);
            if(isAlert(t1)){
                return t1;
            }
            let t2 = this.typeOf(n.children[1], used);
            if(isAlert(t2)){
                return t2;
            }
            if(t1 != t2){
                return this.typeMismatch(n, t1, t2);
            }
            return "boolean";
        } else {
            return this.typeOfId(n, used);
        }
    }
    typeOfId(n: Node, used: boolean): string|Alert {
        let id = n.name
        let current: ScopeNode|null = this.st.current
        while(current != null){
            if(current.stash[id]){
                //If checking the type of some variable, it must
                //be in a context that indicates it's being used
                if(used){
                    current.usedStashed(id);
                    this.warnIfNotInitialized(n);
                }
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
        this.log.push(s);
    }
    typeMismatch(n: Node, expected: string, actual: string): Alert {
        //Add line num to nodes
        return error("Type mismatch on line: "+n.lineNum+ " expected: "+expected+" but got: "+actual);
    }
    //Adds a warning for use of uninitialized variable
    warnIfNotInitialized(n: Node) {
        let id = n.name;
        let current: ScopeNode | null = this.st.current;
        while(current != null) {
            if(current.stash[id] && !current.stash[id].init){
                this.warnings.push(warning("Use of uninitialized variable: "+n.name+" on line: "+n.lineNum));
                return;
            }
            current = current.parent;
        }
    }
    initVariable(id: string) {
        let current: ScopeNode | null = this.st.current;
        while(current!= null) {
            if(current.stash[id]){
                current.stash[id].init = true;
                return;
            }
            current = current.parent;
        }

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
                if(n.stash[id].init) {
                    arr.push(warning("Initialized but unused variable: "+n.stashEntryToString(id)));
                } else {
                    arr.push(warning("Unused variable: "+n.stashEntryToString(id)));
                }
            }
        }
        return arr;
    }
}