import {TokenType, Token, TokenGlyphs} from './Token';
import {SyntaxTree, Node} from './SyntaxTree';

export class Parser {
    cst: SyntaxTree;
    tokens : Token[];
    constructor(tokens: Token[]) {
        //Add initial program token, make root node
        this.cst = new SyntaxTree(new Node("Program", null, ""));
        this.tokens = tokens;
    }
    parse():SyntaxTree {
        let errors = this.parseBlock();
        this.consume(["$"], TokenType.EOP);
        console.log("Errors: "+errors);
        return this.cst;
        //return syntax tree and errors        
    }
    parseBlock() {
        this.cst.addBranchNode(new Node("Block", null, ""));
        let error = this.consume(["{"], TokenType.LBracket);
        if(error) {
            return error;
        }
        this.parseStatementList();
        error = this.consume(["}"], TokenType.RBracket);
        if(error) {
            return error;
        }
        this.cst.moveCurrentUp();
    }
    parseStatementList() {

    }
    consume(search:RegExp[]|string[], want: string): string|null { 
        let cToken = this.tokens.shift();
        if(cToken) {
            for(var exp of search){
                if(cToken.value.match(exp)){
                    this.cst.addLeafNode(new Node(cToken.kind, null, cToken.value));
                    return null;
                }
            }
        } else {
            //Should never happen if Lex was passed
            return "Unexpected end of input";
        }

        
        return "Expected "+want+" got " + cToken.kind+" on line "+ cToken.lineNum;
        
    }
}
