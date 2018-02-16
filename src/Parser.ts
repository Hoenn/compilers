import {TokenType, Token, TokenGlyphs} from './Token';
import {SyntaxTree, Node} from './SyntaxTree';
import {Alert, error, warning} from './Alert';
export class Parser {
    cst: SyntaxTree;
    tokens : Token[];
    log : string[]
    constructor(tokens: Token[]) {
        //Add initial program token, make root node
        this.cst = new SyntaxTree(new Node("Program"));
        this.tokens = tokens;
        this.log = [];
    }
    parse(): {log: string[], cst:SyntaxTree | null, e: Alert |undefined } {
        this.emit("program");
        let error = this.parseBlock();
        if(error) {
            return {log: this.log, cst: this.cst, e: error};
        }
        this.consume(["$"], TokenType.EOP);
        return {log: this.log, cst:this.cst, e: undefined};
        //return syntax tree and errors        
    }
    parseBlock() {
        this.emit("block");
        this.cst.addBranchNode(new Node("Block"));
        let error = this.consume(["{"], TokenType.LBracket);
        if(error) {
            return error;
        }
        error = this.parseStatementList();
        if(error) {
            return error;
        }
        error = this.consume(["}"], TokenType.RBracket);
        if(error) {
            return error;
        }
        this.cst.moveCurrentUp();
    }
    parseStatementList() {
        this.emit("statement list");
        this.cst.addBranchNode(new Node("StatementList"))
        let error = this.parseStatement();
        if (error) {
            return error;
        }
        //If next token is a statement
        //let error = this.parseStatementList()
        this.cst.moveCurrentUp();
    }
    parseStatement(): Alert | undefined{
        this.emit("statement");
        this.cst.addBranchNode(new Node("Statement"));
        //Check if nextToken is print
        let nToken = this.tokens[0].kind;
        let error;
        switch(nToken) {
            case TokenType.LBracket: {
                error = this.parseBlock();
                break;
            }
            case TokenType.Print: {
                //error = this.parsePrint();
                break;
            }
            case TokenType.VarType: {
                //error = this.parseVarDecl();
                break;
            }
            case TokenType.While: {
                //error = this.parseWhile();
                break;
            }
            case TokenType.If: {
                //error = this.parseIf();
                break;
            }
            case TokenType.Id: {
                //error = this.parseAssignment();
                break;
            }
            default: {
                //Either empty statement or unknown token
                //parseBlock will catch unknown or correctly find RBracket
                this.cst.moveCurrentUp();
                return;
            }
        }
        //Propagate any errors from switch
        if(error) {
            return error;
        }
        this.cst.moveCurrentUp();
    }
    consume(search:RegExp[]|string[], want: string): Alert |undefined { 
        let cToken = this.tokens.shift();
        if(cToken) {
            for(var exp of search){
                if(cToken.value.match(exp)){
                    this.cst.addLeafNode(new Node(cToken.kind));
                    return undefined;
                }
            }
        } else {
            //Should never happen if Lex was passed
            return error("Unexpected end of input");
        }

        return error("Expected "+want+" got " + cToken.kind, cToken.lineNum);
        
    }
    emit(s: string) {
        this.log.push("Parsing "+s);
    }
}
