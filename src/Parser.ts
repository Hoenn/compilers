import {TokenType, Token, TokenGlyphs} from './Token';
import {SyntaxTree, Node} from './SyntaxTree';
import {Alert, error, warning} from './Alert';
export class Parser {

    cst: SyntaxTree;
    tokens : Token[];
    log : string[];

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
        //Idea: If next token is not a right a right bracket... 
        //  it must be another expression?

        //If next token is a statement
        //let error = this.parseStatementList()
        this.cst.moveCurrentUp();
    }
    parseStatement(): Alert | undefined{
        this.emit("statement");
        this.cst.addBranchNode(new Node("Statement"));

        //Look at next token to decide how to parse
        let nToken = this.tokens[0].kind;
        let error;
        switch(nToken) {
            case TokenType.LBracket: {
                error = this.parseBlock();
                break;
            }
            case TokenType.Print: {
                error = this.parsePrint();
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
    parsePrint() {
        this.emit("print statement");
        this.cst.addBranchNode(new Node("PrintStatement"));
        this.consume(["print"], "print");
        //"[(]" since ( alone throws malformed RegExp error
        this.consume(["[(]"], "(");
        //let error = parseExpr()
        //if (error) {
        //  return error;
        //}
        this.consume(["[)]"], ")");

        this.cst.moveCurrentUp();
    }
    //search[] may contain string | RegExp
    //want:string is needed for error reporting in case a list of
    //  possible input is being searched for
    consume(search:string[], want: string): Alert |undefined { 
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
