import {SyntaxTree, Node as AbstractNode} from "./SyntaxTree";

export class SemanticAnalyzer {
    ast: SyntaxTree;
    constructor(ast: SyntaxTree) {
        this.ast = ast;
    }
    analyze() {
        /**
         * Construct the symbol tree by doing a pass on the AST
         * While doing so we can
         * Via Nodes
         * Any:
         *  Undeclared Variable
         *  Mark variables as used in the symbol tree
         * Assignment:
         *  Mark variables as initialized
         *  Type Check
         * Plus:
         *  Type Check
         * VarDecl:
         *  Redeclared Variable
         * 
         * 
         * 
         */
        //Pass the symbol tree for unused variables
    }
}